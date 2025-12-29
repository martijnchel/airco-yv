const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

app.post('/airco', async (req, res) => {
    const { publicIp, payload } = req.body;
    // We forceren hier de poort en het pad dat we hebben ontdekt
    const url = `https://${publicIp}:51443/beaver/get_device_status`;

    try {
        const response = await axios({
            method: 'post',
            url: url,
            data: payload,
            // HIER ZIT DE OPLOSSING: De verplichte headers
            headers: {
                'Operator-Id': 'Homey-Proxy-User',
                'X-HK-API-Key': 'none',
                'Content-Type': 'application/json'
            },
            // Omdat de airco een eigen (onveilig) certificaat heeft:
            httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false })
        });
        res.send(response.data);
    } catch (error) {
        res.status(500).send({ 
            error: "Airco onbereikbaar", 
            details: error.message,
            attemptedUrl: url 
        });
    }
});

app.listen(process.env.PORT || 3000);