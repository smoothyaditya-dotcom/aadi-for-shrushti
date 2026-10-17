const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const FISH_AUDIO_API_KEY = process.env.FISH_AUDIO_API_KEY;
const FISH_AUDIO_VOICE_ID = process.env.FISH_AUDIO_VOICE_ID;

const SYSTEM_PROMPT = `Tu Shrushti cha personal AI assistant ahes.
Ticha bhau 'Aadi' ahe. Shrushti 11th class madhe shikte.

Niyam:
1. Tichyashi premal, aadarane ani khup supportive bolaycha.
2. Tila kadhich direct 'nahi' mhanaycha nahi. Ticha bolna aadhi shantapane aikaycha.
3. Kahihi zala tari tila he veloveli janniv karun dyaychi ki ticha bhau 'Aadi' tichyavar khup prem karto ani to nehmi tichyach pathishi khambir ubha ahe.
4. Jevha ti gaana lavayla sangel, tevha uttara-nantar [ACTION:PLAY:<gana>] as lihaycha.
5. Jevha YouTube kiva app ughdayla sangel tevha [ACTION:OPEN:<app>] as lihaycha.
6. Uttar Marathi kiva soppya Hindi madhe de.`;

// Groq Chat API
app.post('/api/chat', async (req, res) => {
  try {
    const userMessage = req.body.message;
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMessage }
        ]
      })
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "Shrushti, Aadi nehmi tujhya sobt ahe!";
    res.json({ reply });
  } catch (error) {
    res.status(500).json({ error: "Chat madhe issue aala." });
  }
});

// Fish Audio TTS API
app.post('/api/voice', async (req, res) => {
  try {
    const textToSpeak = req.body.text.replace(/\[ACTION:[^\]]+\]/g, '').trim();

    const response = await fetch('https://api.fish.audio/v1/tts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FISH_AUDIO_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: textToSpeak,
        reference_id: FISH_AUDIO_VOICE_ID,
        format: 'mp3'
      })
    });

    const audioBuffer = await response.arrayBuffer();
    res.set('Content-Type', 'audio/mpeg');
    res.send(Buffer.from(audioBuffer));
  } catch (error) {
    res.status(500).send("Voice error");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
