const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;
const GROQ_KEY     = process.env.GROQ_API_KEY;
const GEMINI_KEY   = process.env.GEMINI_API_KEY;

// ── SUPABASE HELPER ──
async function sb(path, method = 'GET', body = null) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': method === 'POST' ? 'return=representation' : ''
    },
    body: body ? JSON.stringify(body) : null
  });
  if (!res.ok) return null;
  return res.json().catch(() => null);
}

// ── LOAD MEMORY ──
async function loadMemory(memberId) {
  try {
    // Founder profile
    const profile = await sb('council_founder_profile?select=key,value');
    const profileMap = {};
    if (profile) profile.forEach(r => { profileMap[r.key] = r.value; });

    // Last 10 conversations with this member
    const convos = await sb(
      `council_conversations?member_id=eq.${memberId}&order=created_at.desc&limit=20&select=role,content`
    );

    // Relevant memories (this member + global)
    const memories = await sb(
      `council_memory?or=(member_id.eq.${memberId},member_id.eq.all)&order=created_at.desc&limit=10&select=memory_type,content`
    );

    return { profileMap, convos: convos ? convos.reverse() : [], memories: memories || [] };
  } catch { return { profileMap: {}, convos: [], memories: [] }; }
}

// ── SAVE CONVERSATION ──
async function saveConversation(memberId, role, content) {
  try {
    await sb('council_conversations', 'POST', { member_id: memberId, role, content });
  } catch {}
}

// ── EXTRACT AND SAVE MEMORY ──
async function extractMemory(memberId, userMsg, assistantReply) {
  // Simple heuristic — save decisions and key facts
  const triggers = ['decided', 'will', 'going to', 'plan to', 'focus on', 'priority', 'goal', 'target', 'problem'];
  const lower = userMsg.toLowerCase();
  if (triggers.some(t => lower.includes(t))) {
    await sb('council_memory', 'POST', {
      member_id: memberId,
      memory_type: 'decision',
      content: `Founder said: "${userMsg.slice(0, 200)}"`
    });
  }
}

// ── BUILD CONTEXT STRING ──
function buildContext(profileMap, memories) {
  let ctx = '\n\n── FOUNDER PROFILE (your memory of Olakunle) ──\n';
  Object.entries(profileMap).forEach(([k, v]) => { ctx += `${k}: ${v}\n`; });

  if (memories.length > 0) {
    ctx += '\n── PAST INSIGHTS FROM PREVIOUS SESSIONS ──\n';
    memories.forEach(m => { ctx += `[${m.memory_type}] ${m.content}\n`; });
  }
  return ctx;
}

// ── CALL AI (Groq primary, Gemini fallback) ──
async function callAI(systemPrompt, messages) {
  // Try Groq first
  if (GROQ_KEY) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_KEY}` },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          max_tokens: 1024,
          temperature: 0.85,
          messages: [{ role: 'system', content: systemPrompt }, ...messages]
        })
      });
      if (res.ok) {
        const data = await res.json();
        return data.choices?.[0]?.message?.content || null;
      }
    } catch {}
  }

  // Fallback to Gemini
  if (GEMINI_KEY) {
    try {
      const geminiMessages = messages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents: geminiMessages,
            generationConfig: { maxOutputTokens: 1024, temperature: 0.85 }
          })
        }
      );
      if (res.ok) {
        const data = await res.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
      }
    } catch {}
  }

  return null;
}

// ── MAIN HANDLER ──
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { system, messages, memberId } = req.body;
    if (!memberId) return res.status(400).json({ error: 'memberId required' });

    // Load memory from Supabase
    const { profileMap, convos, memories } = await loadMemory(memberId);
    const contextBlock = buildContext(profileMap, memories);

    // Inject memory into system prompt
    const enrichedSystem = system + contextBlock;

    // Merge stored convos with current messages (last 6 stored + current)
    const storedRecent = convos.slice(-6).map(c => ({ role: c.role, content: c.content }));
    const allMessages = [...storedRecent, ...messages];

    // Get last user message
    const lastUserMsg = messages.filter(m => m.role === 'user').pop()?.content || '';

    // Call AI
    const reply = await callAI(enrichedSystem, allMessages);

    if (!reply) {
      return res.status(503).json({ error: 'All AI providers unavailable. Please try again.' });
    }

    // Save to memory async (don't await — don't slow response)
    saveConversation(memberId, 'user', lastUserMsg);
    saveConversation(memberId, 'assistant', reply);
    extractMemory(memberId, lastUserMsg, reply);

    return res.status(200).json({ content: [{ type: 'text', text: reply }] });

  } catch (err) {
    console.error('Council error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
