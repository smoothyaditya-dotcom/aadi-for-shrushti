const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Direct Keys
const GROQ_API_KEY = "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";
const FISH_AUDIO_API_KEY = "sk-fish-7meDj3dZkXn-uwylFbtkKuaJ_KqAkw3CkHNeHmIr4iE";
const FISH_AUDIO_VOICE_ID = "1e786eebb4f34790b8004442ddc62709";

const SYSTEM_PROMPT = `Tu Shrushti cha personal friendly assistant ahes. Shrushti 11th class madhe ahe.
Ticha bhau Aadi ahe.

Niyam:
1. Normal, cool ani natural mitrasarkh bol. Kitabi kinva formal bhasha nako.
2. Pratyek vakyaat Aadi ch naav ghyaychi bilkul garaj nahi. Fakt kadhitari natural context asel tevha ch bol. Over emotional nako hou.
3. Kadhich tila direct 'nahi' mhanu nako.
4. Gana lavaycha asel tar shevti [ACTION:PLAY:<gana>] as lihi.
5. YouTube ughdaycha asel tar [ACTION:OPEN:YOUTUBE] as lihi.
6. Uttar soppya Marathi kinva Hinglish madhe de.`;

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

    if (!response.ok) {
      return res.status(500).send("Voice error");
    }

    const audioBuffer = await response.arrayBuffer();
    res.set('Content-Type', 'audio/mpeg');
    res.send(Buffer.from(audioBuffer));
  } catch (error) {
    res.status(500).send("Voice generation failed");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server run hot ahe port ${PORT}`));
