import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

type PromptOnly = { prompt: string };

const must = (k: string) => {
  const v = process.env[k];
  if (!v) throw new Error(`Missing app setting: ${k}`);
  return v;
};

app.http("submitTravelRequest", {
  methods: ["POST"],
  authLevel: "anonymous",
  handler: async (req: HttpRequest, ctx: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const { prompt } = (await req.json()) as Partial<PromptOnly>;
      if (!prompt || !prompt.trim()) {
        return { status: 400, jsonBody: { error: "Field 'prompt' is required." } };
      }

      const ALLOWED_ORIGIN = must("ALLOWED_ORIGIN");
      const BODHI_BASE_URL = must("BODHI_BASE_URL").replace(/\/+$/,"");
      const BODHI_WORKFLOW_RUN_PATH = must("BODHI_WORKFLOW_RUN_PATH");
      const BODHI_API_TOKEN = must("BODHI_API_TOKEN");

      // Optional: downstreams (leave unset if not used yet)
      const APPROVALS_WEBHOOK_URL = process.env["APPROVALS_WEBHOOK_URL"];
      const AMEX_BASE_URL = process.env["AMEX_BASE_URL"]?.replace(/\/+$/,"");
      const AMEX_API_KEY = process.env["AMEX_API_KEY"];

      // (future) Inline enrichment: you can add parsing/NLU here to extract
      // origin/destination/dates from the prompt, or let Bodhi workflow do it.

      // Trigger Bodhi workflow (Business Studio API trigger)
      const runUrl = `${BODHI_BASE_URL}${BODHI_WORKFLOW_RUN_PATH}`;
      const bodhiPayload = {
        metadata: { source: "azure-functions", submittedAt: new Date().toISOString() },
        input: { prompt }
      };

      const bodhiRes = await fetch(runUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${BODHI_API_TOKEN}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(bodhiPayload)
      });

      if (!bodhiRes.ok) {
        const txt = await bodhiRes.text();
        ctx.error(`Bodhi trigger failed: ${bodhiRes.status} ${txt}`);
        return { status: 502, jsonBody: { error: "Failed to trigger Bodhi workflow", details: txt } };
      }
      const bodhiJson = await bodhiRes.json();

      // Optional approvals: can be wired later without UI changes
      if (APPROVALS_WEBHOOK_URL) {
        const appr = await fetch(APPROVALS_WEBHOOK_URL, {
          method: "POST",
          headers: {"Content-Type":"application/json"},
          body: JSON.stringify({
            type: "travel-approval-request",
            prompt,
            bodhiRunRef: bodhiJson?.runId ?? bodhiJson?.id ?? null
          })
        });
        if (!appr.ok) ctx.warn(`Approvals webhook failed: ${appr.status} ${await appr.text()}`);
      }

      const responseBody = {
        requestId: bodhiJson?.runId ?? bodhiJson?.id ?? crypto.randomUUID(),
        status: "submitted"
      };

      return {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": ALLOWED_ORIGIN
        },
        jsonBody: responseBody
      };
    } catch (err: any) {
      return { status: 500, jsonBody: { error: err?.message || String(err) } };
    }
  }
});