const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

app.post('/airco', async (req, res) => {
    const { publicIp, payload } = req.body;
    
    // Deze paden zijn specifiek voor de nieuwste WF-RAC firmware
    const targets = [
        `https://${publicIp}:51443/beaver/get_device_status`, // Standaard
        `https://${publicIp}:51443/m-air/get_device_status`, // Nieuwste firmware
        `https://${publicIp}:51443/beaver/get_config`,        // Configuratie pad
        `https://${publicIp}:51443/smart_mair/get_status`    // Alternatief
    ];

    for (let url of targets) {
        try {
            console.log("Testen: " + url);
            const response = await axios({
                method: 'post',
                url: url,
                data: payload,
                headers: { 
                    'Operator-Id': 'Homey-User-1', 
                    'X-HK-API-Key': 'none' 
                },
                httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false }),
                timeout: 4000
            });
            console.log("✅ MATCH! Pad gevonden: " + url);
            return res.send(response.data);
        } catch (error) {
            console.log(`❌ ${url} -> Status: ${error.response ? error.response.status : 'Geen reactie'}`);
        }
    }

    res.status(500).send({ error: "Geen van de paden werkte. Airco weigert toegang." });
});

app.listen(process.env.PORT || 3000);