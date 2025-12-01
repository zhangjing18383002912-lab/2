
export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405 });
  }

  const SERVER_CONFIG = {
    BASE_URL: "https://api.siliconflow.cn/v1",
    API_KEY: "sk-rhwbvllxdmirmvatitnueiithpvmxuusgvwdbeozbpdegyzo",
    MODEL: "deepseek-ai/DeepSeek-V3.1-Terminus"
  };

  try {
    const bodyText = await req.text();
    const body = JSON.parse(bodyText);
    const { messages } = body;

    const upstreamUrl = `${SERVER_CONFIG.BASE_URL}/chat/completions`;

    const payload = {
      model: SERVER_CONFIG.MODEL,
      messages: messages,
      stream: true, 
      temperature: 0.7,
      max_tokens: 4096, // Increased from 512 to 4096 to prevent truncation of long answers
      top_p: 0.7
    };

    const upstreamResponse = await fetch(upstreamUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVER_CONFIG.API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    if (!upstreamResponse.ok) {
      const errText = await upstreamResponse.text();
      return new Response(JSON.stringify({ error: `AI 服务响应错误: ${upstreamResponse.status}` }), { 
        status: upstreamResponse.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Return the stream directly
    return new Response(upstreamResponse.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: `服务器内部错误: ${error.message}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
