# SmartOffice AI Chatbot Widget

A sophisticated, persistent, and intelligent chatbot widget designed for easy integration into any business website. Powered by Claude AI (Anthropic).

## Key Features

### 1. Smart Persistence (localStorage)
The widget remembers the business configuration (`businessName`, `websiteUrl`, `sheetUrl`) across page refreshes.
- **How it works:** Data is stored in the browser's `localStorage` both on the host site and within the chatbot iframe.
- **Benefit:** Owners and visitors don't have to re-configure the bot every time they reload the page.

### 2. Dynamic Google Sheets Logging
Every conversation is logged to a Google Sheet for lead tracking and analysis.
- **Customizable:** Different customers can use their own Google Sheets by providing a `sheetUrl` in the configuration.
- **Reliable:** The backend ensures logging is completed before sending the AI response, guaranteeing 100% data capture.

### 3. Intelligent Auto-Fill (Smart Fill)
A specialized AI tool that reads the business website automatically to populate the bot's knowledge base.
- **Feature:** Click "✨ AI Auto-Fill" in the setup screen to have the AI analyze the site and extract business details.

### 4. Automatic Launch
The bot detects configuration passed via URL parameters or stored locally to skip the setup screen and open directly into the chat interface.

### 5. High-Intelligence AI
Powered by `claude-haiku-4-5-20251001` for fast, cost-effective, and sophisticated "White Glove" customer service responses.

## Configuration Guide

To install the bot, add the following script just before the `</body>` tag:

```html
<script>
  window.ChatbotConfig = {
    websiteUrl: "your-website.com",
    businessName: "Your Business Name",
    sheetUrl: "https://script.google.com/macros/s/YOUR_APPS_SCRIPT_ID/exec" // Optional
  };
</script>
<script src="https://chatbot-demo-virid.vercel.app/widget.js"></script>
```

## Project Structure

- `widget.js`: The "Injector" script that creates the bubble and iframe.
- `index.html`: The main chatbot application (Frontend).
- `api/chat.js`: The backend handler for AI processing and Google Sheets logging.
- `api/suggest.js`: The backend handler for the "Smart Fill" feature.
- `server.js`: Local development server.
- `vercel.json`: Configuration for Vercel deployment and routing.

## Recent Fixes
- Fixed `localStorage` syncing between the host site and the widget.
- Resolved `404 Not Found` errors for AI models by using standard model IDs.
- Ensured Google Sheet logging is synchronous to prevent data loss on serverless environments.
- Added business identifiers (Name + Website) to the Google Sheet logs for better tracking.
