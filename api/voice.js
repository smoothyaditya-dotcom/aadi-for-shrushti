export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const { text } = await req.json();
    const cleanText = text.replace(/\[ACTION:[^\]]+\]/g, '').trim();

    const FISH_KEY = "sk-fish-7meDj3dZkXn-uwylFbtkKuaJ_KqAkw3CkHNeHmIr4iE";
    const VOICE_ID = "1e786eebb4f34790b8004442ddc62709";

    const response = await fetch('https://api.fish.audio/v1/tts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FISH_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: cleanText,
        reference_id: VOICE_ID,
        format: 'mp3'
      })
    });

    const audioBuffer = await response.arrayBuffer();
    return new Response(audioBuffer, {
      status: 200,
      headers: { 'Content-Type': 'audio/mpeg' }
    });
  } catch (e) {
    return new Response('Voice error', { status: 500 });
  }
}

