const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const FISH_AUDIO_API_KEY = process.env.FISH_AUDIO_API_KEY;
const FISH_AUDIO_VOICE_ID = process.env.FISH_AUDIO_VOICE_ID;

const SYSTEM_PROMPT = `तू सृष्टीचा पर्सनल AI असिस्टंट आहेस. तिचा भाऊ 'आदी' आहे. सृष्टी ११वीत शिकते.
नियम:
१. सृष्टीशी अतिशय आपुलकीने, गोड, आदरपूर्वक आणि काळजीवाहू मित्रासारखे बोलायचे.
२. तिला कधीही थेट 'नाही' म्हणायचे नाही. तिचे म्हणणे आधी शांतपणे ऐकून घ्यायचे.
३. प्रत्येक संभाषणात अत्यंत सहजपणे जाणीव करून द्यायची की तिचा भाऊ 'आदी' तिच्यावर खूप प्रेम करतो आणि तो नेहमी तिच्याच पाठीशी खंबीर उभा आहे.
४. जर तिने गाणे लावायला सांगितले, तर उत्तराच्या शेवटी नक्की [ACTION:PLAY:<गाण्याचे नाव>] असे लिहायचे.
५. जर तिने YouTube किंवा ॲप उघडायला सांगितले, तर [ACTION:OPEN:YOUTUBE] असे लिहायचे.
६. उत्तर मराठी किंवा सोप्या हिंदीत द्यायचे.`;

// Chat Route
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
      res.json({ reply: "सृष्टी, मी ऐकतोय तुला! सांग काय करू? आणि आदी नेहमी तुझ्याच सोबत आहे, काळजी नको करू!" });
    }
  } catch (error) {
    res.json({ reply: "सृष्टी, मी इथेच आहे तुझ्यासोबत! आदी नेहमी तुझ्या पाठीशी आहे." });
  }
});

// Voice Route
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
      return res.status(500).send("Fish Audio error");
    }

    const audioBuffer = await response.arrayBuffer();
    res.set('Content-Type', 'audio/mpeg');
    res.send(Buffer.from(audioBuffer));
  } catch (error) {
    res.status(500).send("Voice generation failed");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
