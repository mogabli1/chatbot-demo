require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/demo', (req, res) => res.sendFile(path.join(__dirname, 'demo.html')));
app.get('/widget.js', (req, res) => res.sendFile(path.join(__dirname, 'widget.js')));

app.post('/suggest', async (req, res) => {
  const { name, category, url } = req.body;
  let context = `Business Name: ${name || 'Unknown'}\nCategory: ${category || 'General Business'}`;

  if (url) {
    try {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), 8000);
      const r = await fetch(url, { signal: controller.signal, headers: { 'User-Agent': 'Mozilla/5.0' } });
      let html = await r.text();
      let webContent = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 5000);
      context += `\n\nActual Website Content:\n${webContent}`;
    } catch(e) {}
  }

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 800,
      system: `You are a professional business analyst. Based on the provided business name and website content, extract and generate professional details. Output ONLY a valid JSON object with these keys: "bio", "contact", "pricing", "category", "hours".`,
      messages: [{ role: 'user', content: context }]
    });
    
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
});

app.post('/chat', async (req, res) => {
  const { message, history, bizInfo } = req.body;
  if (!message) return res.status(400).json({ error: 'No message provided' });

  let websiteContent = '';
  if (bizInfo.website) {
    try {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), 8000);
      const r = await fetch(bizInfo.website, { signal: controller.signal, headers: { 'User-Agent': 'Mozilla/5.0' } });
      let html = await r.text();
      websiteContent = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 3000);
    } catch(e) {}
  }

  const additionalInfo = `type: ${bizInfo.type||'N/A'}, hours: ${bizInfo.hours||'N/A'}, location: ${bizInfo.location||'N/A'}, contact: ${bizInfo.contact||'N/A'}, pricing: ${bizInfo.price||'N/A'}, extra: ${bizInfo.extra||'N/A'}`;

  const systemPrompt = `You are a sophisticated, senior-level Customer Success Executive for "${bizInfo.name || 'this business'}". 

IDENTITY & TONE:
- Use a "White Glove" service tone: highly professional, helpful, and proactive.
- Use "we" and "our" to represent the company.
- Avoid robotic "I don't know" lists.

KNOWLEDGE BASE:
${websiteContent ? `[PRIMARY SOURCE - WEBSITE]:\n${websiteContent}\n` : ''}
[FACT SHEET]:\n${additionalInfo}

HANDLING UNCERTAINTY (PROFESSIONAL PIVOTING):
- If a user asks for a specific fact NOT in your knowledge base:
  1. DO NOT say "I don't have that information" or "I don't have it handy."
  2. PIVOT gracefully. (e.g., "As a global enterprise, we are always reachable via email for specific inquiries.")
  3. LEAD the conversation. Offer a related value-add.

CONSTRAINTS:
- Keep responses clean and well-formatted with Markdown (bolding, headers).
- Never invent facts.
- Always conclude with a helpful follow-up question.`;

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      system: systemPrompt,
      messages: [...(history||[]), { role: 'user', content: message }]
    });
    res.json({ reply: response.content[0].text });
  } catch (error) {
    res.status(500).json({ error: `AI service error: ${error.message}` });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Running at http://localhost:${PORT}`));
module.exports = app;
