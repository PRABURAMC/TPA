const LOGIC_APP_URL = "https://prod-02.eastus.logic.azure.com:443/workflows/d32f090eaac54b07b3ce7913f8dd89cf/triggers/When_an_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_an_HTTP_request_is_received%2Frun&sv=1.0&sig=V0DSNZriBhtgRhUMeCsHKgWb_Ulp_kcgQM7h0qY2zvE";

async function submitPrompt(prompt) {
  const res = await fetch(LOGIC_APP_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt })
  });

  const data = await res.json();
  console.log("Bodhi response:", data);
}