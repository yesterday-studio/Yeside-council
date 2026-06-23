export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return res.status(200).json({
      status: 'ERROR',
      problem: 'GROQ_API_KEY is not set in Vercel environment variables',
      fix: 'Go to Vercel > Project > Settings > Environment Variables and add GROQ_API_KEY'
    });
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        max_tokens: 50,
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'Say exactly: Yeside Council is live!' }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(200).json({
        status: 'API_ERROR',
        error: data?.error?.message,
        code: data?.error?.code
      });
    }

    const text = data.choices?.[0]?.message?.content;
    return res.status(200).json({
      status: 'SUCCESS',
      message: text,
      model: 'llama-3.1-8b-instant via Groq',
      free: true
    });

  } catch (err) {
    return res.status(200).json({ status: 'FETCH_ERROR', error: err.message });
  }
}
