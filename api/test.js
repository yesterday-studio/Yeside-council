export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const checks = {
    GROQ_API_KEY:    !!process.env.GROQ_API_KEY,
    GEMINI_API_KEY:  !!process.env.GEMINI_API_KEY,
    SUPABASE_URL:    !!process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: !!process.env.SUPABASE_ANON_KEY
  };

  const missing = Object.entries(checks).filter(([,v]) => !v).map(([k]) => k);

  if (missing.length > 0) {
    return res.status(200).json({
      status: 'MISSING_ENV',
      missing,
      fix: 'Add these to Vercel → Project → Settings → Environment Variables'
    });
  }

  // Test Groq
  let groqStatus = 'not tested';
  if (process.env.GROQ_API_KEY) {
    try {
      const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.GROQ_API_KEY}` },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant', max_tokens: 20,
          messages: [{ role: 'user', content: 'Say: live' }]
        })
      });
      groqStatus = r.ok ? 'OK' : `ERROR ${r.status}`;
    } catch (e) { groqStatus = 'FETCH_ERROR: ' + e.message; }
  }

  // Test Supabase
  let supabaseStatus = 'not tested';
  try {
    const r = await fetch(`${process.env.SUPABASE_URL}/rest/v1/council_founder_profile?limit=1`, {
      headers: { 'apikey': process.env.SUPABASE_ANON_KEY, 'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}` }
    });
    supabaseStatus = r.ok ? 'OK' : `ERROR ${r.status} — run supabase_council_memory.sql first`;
  } catch (e) { supabaseStatus = 'FETCH_ERROR: ' + e.message; }

  return res.status(200).json({
    status: 'CHECKED',
    groq: groqStatus,
    supabase: supabaseStatus,
    env: checks
  });
}
