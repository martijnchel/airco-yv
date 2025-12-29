const express = require('express');
const axios = require('axios');
const https = require('https');
const app = express();

app.use(express.json());

// De cruciale stap: negeer onveilige certificaten
const agent = new https.Agent({
  rejectUnauthorized: false
});

app.post('/airco', async (req, res) => {
  const { publicIp, payload } = req.body;
  
  if (!publicIp) return res.status(400).send("Mis publiek IP");

  const url = `https://${publicIp}:51443/beaver/command/set_device_status`;

  console.log(`Verzoek doorsturen naar: ${url}`);

  try {
    const response = await axios.post(url, payload, {
      httpsAgent: agent,
      timeout: 10000,
      headers: { 'Content-Type': 'application/json' }
    });
    
    console.log("Succesvol aangestuurd!");
    res.json(response.data);
  } catch (error) {
    console.error("Fout bij aansturen airco:", error.message);
    res.status(500).json({ 
      error: "Airco onbereikbaar", 
      details: error.message 
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy draait op poort ${PORT}`));