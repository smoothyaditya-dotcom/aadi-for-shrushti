export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const { message } = await req.json();
    const GROQ_KEY = "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";

    const SYSTEM_PROMPT = `Tu Shrushti cha personal friendly AI assistant ahes. Shrushti 11th class madhe shikte. Ticha bhau Aadi ahe.
Niyam:
1. Normal, cool ani friendly mitrasarkh bol. Formal bhasha nako.
2. Pratyek vakyaat Aadi ch naav ghyaychi garaj nahi, fakt garaj asel tevha ch bol.
3. Tila kadhich direct 'nahi' mhanu nako.
4. Gana lavaycha asel tar shevti [ACTION:PLAY:<gana>] as lihi.
5. YouTube ughdaycha asel tar shevti [ACTION:OPEN:YOUTUBE] as lihi.
6. Uttar Marathi kinva Hinglish madhe de.`;

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: message }
        ]
      })
    });

    const data = await groqRes.json();
    const reply = data.choices?.[0]?.message?.content || "Bol Shrushti, kay madat karu?";

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ reply: "Aadi nehmi pathishi ahe, bol Shrushti!" }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
