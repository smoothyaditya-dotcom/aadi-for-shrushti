const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Direct Groq Key
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
    console.log("User message:", userMessage);

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
        ],
        temperature: 0.7,
        max_tokens: 250
      })
    });

    const data = await response.json();
    console.log("Groq Response:", JSON.stringify(data));

    if (data.choices && data.choices[0] && data.choices[0].message) {
      return res.json({ reply: data.choices[0].message.content });
    } else {
      console.error("Groq Error details:", data);
      return res.json({ reply: "Are Shrushti, sang na kay madat karu? Mi aiktoy!" });
    }
  } catch (error) {
    console.error("Server catch error:", error);
    return res.json({ reply: "Aadi nehmi sobt ahe, bol Shrushti!" });
  }
});

// Voice Route (Fish Audio)
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

    if (!response.ok) {
      return res.status(500).send("Voice API error");
    }

    const audioBuffer = await response.arrayBuffer();
    res.set('Content-Type', 'audio/mpeg');
    res.send(Buffer.from(audioBuffer));
  } catch (err) {
    res.status(500).send("TTS failure");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
