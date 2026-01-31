const LOGIC_APP_URL = "https://prod-02.eastus.logic.azure.com:443/workflows/d32f090eaac54b07b3ce7913f8dd89cf/triggers/When_an_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_an_HTTP_request_is_received%2Frun&sv=1.0&sig=V0DSNZriBhtgRhUMeCsHKgWb_Ulp_kcgQM7h0qY2zvE";

// Example: https://prod-22.eastus.logic.azure.com:443/workflows/.../invoke?api-version=2016-10-01...

document.getElementById("promptForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const prompt = document.getElementById("prompt").value.trim();
    const outputBox = document.getElementById("responseOutput");

    if (!prompt) {
        outputBox.textContent = "⚠ Please enter a prompt.";
        return;
    }

    outputBox.textContent = "⏳ Sending request...";

    try {
        const res = await fetch(LOGIC_APP_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt })
        });

        const data = await res.json();
        outputBox.textContent = JSON.stringify(data, null, 2);
    } catch (err) {
        outputBox.textContent = "❌ Error: " + err.message;
    }
});