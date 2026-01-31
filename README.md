
# TPA Travel Request (Azure Static Web App + Functions)

A minimal travel request application:
- UI captures travel details and a *free-text prompt*
- Serverless API posts to Bodhi AI Studio workflow
- Optional notification email handled by Bodhi or a separate service

## Tech
- Azure Static Web Apps (SWA)
- Azure Functions (Managed by SWA, Node.js 18)
- Vanilla HTML/CSS/JS

## Deployment (no GitHub)
1. Install VS Code extensions:
   - **Azure Static Web Apps**
   - **Azure Account**
2. Sign in to Azure in VS Code.
3. Open this folder in VS Code.
4. `F1` → **Azure Static Web Apps: Create and Deploy**
   - App location: `/`
   - API location: `/api`
   - Output location: `/`
5. In Azure Portal → your Static Web App → **Configuration** add:
   - `BODHI_WORKFLOW_URL`
   - `BODHI_API_KEY`

## API Contract
**POST** `/api/submit-travel-request`

```json
{
  "employeeName": "Praburam C",
  "employeeEmail": "praburam@your-company.com",
  "destination": "Bengaluru, India",
  "depart": "2026-02-10",
  "return": "2026-02-13",
  "costCenter": "CC-1342",
  "approverEmail": "amandeep.garg@your-company.com",
  "purpose": "Data center migration workshop",
  "prompt": "Morning flights only; hotel near Manyata; budget ₹15k/night"
}
```

**Response** (text):
```
Travel request submitted successfully. Workflow ID: <id>.
```

## Notes
- If you use a separate Function App, update the UI `fetch` URL to the full function endpoint and configure CORS.
- Prefer letting **Bodhi** send emails from the workflow for simplicity.
