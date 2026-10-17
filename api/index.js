const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const GROQ_API_KEY = "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";

const SYSTEM_PROMPT = `Tu Shrushti cha personal sweet ani supportive assistant ahes. Shrushti 11th class madhe shikte. Ticha bhau Aadi ahe.
Niyam:
1. Shrushtishi ekdam casual, cool ani friendly mitrasarkh bol.
2. Tila kadhich direct 'nahi' mhanaycha nahi. 
3. Uttar nehmi Marathi kinva Hinglish madhe chota ani mast de.
4. Jevha ti gaana lavayla sangel, tevha shevti nakki [ACTION:PLAY:<gana>] as lihi.
5. Jevha ti YouTube ughdayla sangel, tevha [ACTION:OPEN:YOUTUBE] as lihi.`;

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
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMessage }
        ]
      })
    });

    const data = await response.json();
    if (data.choices && data.choices[0]) {
      res.json({ reply: data.choices[0].message.content });
    } else {
      res.json({ reply: "Bol Shrushti, kay madat karu?" });
    }
  } catch (error) {
    res.json({ reply: "Bol Shrushti, kay challay?" });
  }
});

app.post('/api/voice', async (req, res) => {
  try {
    const FISH_AUDIO_API_KEY = "sk-fish-7meDj3dZkXn-uwylFbtkKuaJ_KqAkw3CkHNeHmIr4iE";
    const FISH_AUDIO_VOICE_ID = "1e786eebb4f34790b8004442ddc62709";

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
  } catch (err) {
    res.status(500).send("TTS error");
  }
});

module.exports = app;
