const Anthropic = require('@anthropic-ai/sdk');
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function fetchWebsiteContent(url) {
  try {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 8000);
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SmartOfficeBot/1.0)' }
    });
    let html = await response.text();
    return html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 5000);
  } catch (err) {
    return null;
  }
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, category, url } = req.body;
  if (!name && !url) return res.status(400).json({ error: 'Name or URL is required' });

  let context = `Business Name: ${name || 'Unknown'}\nCategory: ${category || 'General Business'}`;
  
  if (url) {
    const webContent = await fetchWebsiteContent(url);
    if (webContent) {
      context += `\n\nActual Website Content:\n${webContent}`;
    }
  }

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 800,
      system: `You are a professional business analyst. Based on the provided business name and website content, extract and generate professional details. 
      Output ONLY a valid JSON object with these keys: 
      "bio" (a professional multi-paragraph summary), 
      "contact" (any phone/email/whatsapp found), 
      "pricing" (general pricing info or a professional statement on how to get a quote),
      "category" (short business type),
      "hours" (operating hours if found).`,
      messages: [{ role: 'user', content: context }]
    });

    // Try to parse JSON from the response
    let suggestion;
    try {
      const text = response.content[0].text;
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      suggestion = JSON.parse(jsonMatch ? jsonMatch[0] : text);
    } catch (e) {
      suggestion = { bio: response.content[0].text };
    }

    res.json({ suggestion });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
