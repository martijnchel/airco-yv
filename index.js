const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

app.post('/airco', async (req, res) => {
    const { publicIp, payload } = req.body;
    
    // We testen nu het kortere pad omdat /beaver/ een 404 geeft
    const url = `https://${publicIp}:51443/beaver/get_device_status`;
    const altUrl = `https://${publicIp}:51443/get_device_status`;

    try {
        console.log("Poging 1 op: " + url);
        const response = await axios({
            method: 'post',
            url: url,
            data: payload,
            headers: { 'Operator-Id': 'Homey-Proxy', 'X-HK-API-Key': 'none' },
            httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false }),
            timeout: 5000
        });
        return res.send(response.data);
    } catch (error) {
        if (error.response && error.response.status === 404) {
            console.log("Poging 2 (Alternatief pad) op: " + altUrl);
            try {
                const responseAlt = await axios({
                    method: 'post',
                    url: altUrl,
                    data: payload,
                    headers: { 'Operator-Id': 'Homey-Proxy', 'X-HK-API-Key': 'none' },
                    httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false })
                });
                return res.send(responseAlt.data);
            } catch (errAlt) {
                return res.status(500).send({ error: "Beide paden geven 404", details: errAlt.message });
            }
        }
        res.status(500).send({ error: "Airco onbereikbaar", details: error.message });
    }
});

app.listen(process.env.PORT || 3000);