export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(200).json({
      status: 'ERROR',
      problem: 'GEMINI_API_KEY is not set in Vercel environment variables',
      fix: 'Go to https://aistudio.google.com/app/apikey → get free key → add to Vercel Settings → Environment Variables'
    });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: 'Say exactly: Council is live and ready!' }] }],
          generationConfig: { maxOutputTokens: 50 }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(200).json({
        status: 'API_ERROR',
        error: data?.error?.message,
        code: data?.error?.code
      });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return res.status(200).json({
      status: 'SUCCESS',
      message: text,
      model: 'gemini-2.0-flash',
      free: true
    });

  } catch (err) {
    return res.status(200).json({ status: 'FETCH_ERROR', error: err.message });
  }
}
