export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return res.status(200).json({
      status: 'ERROR',
      problem: 'ANTHROPIC_API_KEY is not set in Vercel environment variables',
      fix: 'Go to Vercel > Project > Settings > Environment Variables and add ANTHROPIC_API_KEY'
    });
  }

  // Test the actual API call
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 50,
        messages: [{ role: 'user', content: 'Say: Council is live!' }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(200).json({
        status: 'API_ERROR',
        httpStatus: response.status,
        error: data?.error?.message,
        type: data?.error?.type,
        keyPrefix: apiKey.substring(0, 16) + '...'
      });
    }

    return res.status(200).json({
      status: 'SUCCESS',
      message: data.content?.[0]?.text,
      model: data.model,
      keyPrefix: apiKey.substring(0, 16) + '...'
    });

  } catch (err) {
    return res.status(200).json({
      status: 'FETCH_ERROR',
      error: err.message
    });
  }
}
