# Project Instructions: Chatbot Demo

## 🤖 Project Context
- **Function:** Professional chatbot widget with Google Sheets integration.
- **Model:** `claude-haiku-4-5-20251001`.
- **Deployment:** Vercel (`https://chatbot-demo-virid.vercel.app/`).

## 🛠️ Technical Logic
- **Logging:** Uses `logToSheet` to record conversations in Google Sheets.
- **Payload:** Requires both `website` and `business` keys for correct sheet headers.
- **Persistence:** Maintains chat history in the widget UI.

## 🔒 Security
- Uses environment variables for API keys and Sheet credentials.

## 🌐 GitHub Status
- **Repo:** `https://github.com/mogabli1/chatbot-demo.git`
- **Branch:** `master`
- **Sync Note:** Final security version with hidden 5-click trigger live on Vercel.


