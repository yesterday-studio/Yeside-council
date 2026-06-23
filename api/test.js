export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(200).json({
      status: 'ERROR',
      problem: 'GEMINI_API_KEY is not set in Vercel environment variables',
      fix: 'Go to Vercel > Project > Settings > Environment Variables and add GEMINI_API_KEY'
    });
  }

  try {
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: 'You are a helpful assistant.' }] },
          contents: [
            { role: 'user', parts: [{ text: 'Say exactly: Yeside Council is live!' }] }
          ],
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
      model: 'gemini-2.5-flash',
      free: true
    });

  } catch (err) {
    return res.status(200).json({ status: 'FETCH_ERROR', error: err.message });
  }
}
