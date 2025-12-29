const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

app.post('/airco', async (req, res) => {
    const { publicIp, payload } = req.body;
    
    // We maken een lijst met alle mogelijke combinaties die we op GitHub vinden
    const targets = [
        `https://${publicIp}:51443/beaver/get_device_status`,
        `http://${publicIp}:51443/beaver/get_device_status`,
        `https://${publicIp}:51443/get_device_status`,
        `https://${publicIp}:51443/beaver/get_config`
    ];

    for (let url of targets) {
        try {
            console.log("Proberen: " + url);
            const response = await axios({
                method: 'post',
                url: url,
                data: payload,
                headers: { 
                    'Operator-Id': 'Homey-Proxy', 
                    'X-HK-API-Key': 'none',
                    'Accept': 'application/json'
                },
                httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false }),
                timeout: 3000
            });
            console.log("✅ MATCH GEVONDEN op: " + url);
            return res.send({ success: true, url: url, data: response.data });
        } catch (error) {
            console.log(`❌ Gefaald op ${url} (Status: ${error.response ? error.response.status : 'Timeout'})`);
        }
    }

    res.status(500).send({ 
        error: "Alle paden gaven een 404 of timeout", 
        getest: targets 
    });
});

app.listen(process.env.PORT || 3000);