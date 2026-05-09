const Anthropic = require('@anthropic-ai/sdk');

const SHEET_URL = process.env.GOOGLE_SHEET_URL;

async function fetchWebsiteContent(url) {
  if (!url) return null;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SmartOfficeBot/1.0)' }
    });
    clearTimeout(timeout);
    let html = await response.text();
    return html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 3000);
  } catch (err) {
    console.error('Fetch error:', err.message);
    return null;
  }
}

async function logToSheet(url, business, userMessage, botReply) {
  if (!url) return;
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        website: business,
        business: business, 
        userMessage, 
        botReply 
      })
    });
  } catch (err) {
    console.error('Sheet logging error:', err.message);
  }
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { message, history, bizInfo = {} } = req.body || {};
    if (!message) return res.status(400).json({ error: 'No message provided' });

    const rawKey = process.env.ANTHROPIC_API_KEY;
    if (!rawKey) {
      console.error('ANTHROPIC_API_KEY is missing');
      return res.status(500).json({ error: 'AI configuration error (API Key missing)' });
    }

    const client = new Anthropic({ apiKey: rawKey.trim() });

    let websiteContent = '';
    if (bizInfo.website) {
      websiteContent = await fetchWebsiteContent(bizInfo.website) || '';
    }

    const infoParts = [];
    if (bizInfo.type) infoParts.push(`Business Type: ${bizInfo.type}`);
    if (bizInfo.hours) infoParts.push(`Operating Hours: ${bizInfo.hours}`);
    if (bizInfo.location) infoParts.push(`Address/Location: ${bizInfo.location}`);
    if (bizInfo.contact) infoParts.push(`Contact Details: ${bizInfo.contact}`);
    if (bizInfo.price) infoParts.push(`Pricing/Fees: ${bizInfo.price}`);
    if (bizInfo.booking) infoParts.push(`How to Donate/Book: ${bizInfo.booking}`);
    if (bizInfo.extra) infoParts.push(`Additional Background: ${bizInfo.extra}`);
    
    const additionalInfo = infoParts.join('\n');

    const businessName = bizInfo.name || 'this business';
    const systemPrompt = `You are a sophisticated, senior-level Customer Success Executive for "${businessName}". 

IDENTITY & TONE:
- Use a "White Glove" service tone: highly professional, warm, and proactive.
- Use "we" and "our" to represent the company.
- Keep responses conversational and natural. Avoid using too many large Markdown headers (like # or ##) unless presenting a complex report.
- Respond directly to the user's question first, then provide supporting details.

KNOWLEDGE BASE:
${websiteContent ? `[PRIMARY SOURCE - WEBSITE]:\n${websiteContent}\n` : ''}
${additionalInfo ? `[FACT SHEET]:\n${additionalInfo}\n` : ''}

HANDLING UNCERTAINTY:
- If a user asks for a specific fact NOT in your knowledge base, PIVOT gracefully. Lead the conversation toward what we CAN do or how they can find out.

CONSTRAINTS:
- Keep responses clean and readable.
- Never invent facts or phone numbers.
- Always conclude with a helpful follow-up question that encourages engagement.`;

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1000,
      system: systemPrompt,
      messages: [...(history || []), { role: 'user', content: message }]
    });

    const reply = response.content[0].text;

    // Log to Google Sheets (await to ensure completion in serverless environment)
    const targetSheet = bizInfo.sheetUrl || SHEET_URL;
    const businessIdentifier = bizInfo.name && bizInfo.website 
      ? `${bizInfo.name} (${bizInfo.website})` 
      : (bizInfo.name || bizInfo.website || 'Unknown Business');
      
    await logToSheet(targetSheet, businessIdentifier, message, reply);

    res.json({ reply });

  } catch (error) {
    console.error('Chat API Error:', error);
    res.status(500).json({ error: `Chat service error: ${error.message}` });
  }
};
