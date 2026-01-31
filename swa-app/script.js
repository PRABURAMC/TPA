(async () => {
  const form = document.getElementById('promptForm');
  const status = document.getElementById('status');
  const btn = document.getElementById('submitBtn');

  // Set to your deployed Function App base URL
  const FUNCTION_BASE = "https://<your-function-app>.azurewebsites.net";
  const API_URL = `${FUNCTION_BASE}/api/submitTravelRequest`;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const prompt = document.getElementById('prompt').value?.trim();
    if (!prompt) { status.textContent = "Please enter a prompt."; return; }
    status.textContent = "Submitting…"; btn.disabled = true;

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ prompt })
      });
      const json = await res.json().catch(()=>({}));
      if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`);
      status.textContent = `Submitted • RequestId: ${json.requestId} • Status: ${json.status}`;
      form.reset();
    } catch (err) {
      status.textContent = `Failed: ${err.message}`;
      console.error(err);
    } finally {
      btn.disabled = false;
    }
  });
})();