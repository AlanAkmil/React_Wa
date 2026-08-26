const axios = require('axios');
const crypto = require('crypto');

const baseUrl = 'https://amba-react-pi.vercel.app';
const CONFIG_API = `${baseUrl}/api/config`;
const REACT_API = `${baseUrl}/api/react`;

async function getSecretKey() {
    try {
        const res = await axios.get(CONFIG_API, { timeout: 5000 });
        if (res.data?.secret) return res.data.secret;
        throw new Error('Secret key tidak ditemukan');
    } catch (err) {
        return 'AMBA_ULTRA_SECURE_KEY_2026_XYZ#!'; 
    }
}

function generateSignature(payloadString, timestamp, secret) {
    const message = timestamp + payloadString;
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(message);
    return hmac.digest('hex');
}

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }

    try {
        const { link, emojis, count = 1, mode = "1" } = req.body;

        if (!link) {
            return res.status(400).json({ success: false, message: 'Link WhatsApp wajib diisi!' });
        }

        let emojiArr = [];
        if (typeof emojis === 'string') {
            emojiArr = emojis.split(',').map(e => e.trim()).filter(e => e.length > 0);
        } else if (Array.isArray(emojis)) {
            emojiArr = emojis;
        }

        if (emojiArr.length === 0) {
            emojiArr = ["🔥"];
        } else if (emojiArr.length > 4) {
            emojiArr = emojiArr.slice(0, 4);
        }

        const finalEmojiStr = emojiArr.join(',');
        const secret = await getSecretKey();
        
        const payload = {
            mode: String(mode),
            link: link,
            emoji: finalEmojiStr,
            count: Number(count)
        };

        const payloadString = JSON.stringify(payload);
        const timestamp = Date.now().toString();
        const signature = generateSignature(payloadString, timestamp, secret);

        const apiRes = await axios.post(REACT_API, payloadString, {
            headers: {
                'Content-Type': 'application/json',
                'X-Timestamp': timestamp,
                'X-Signature': signature,
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36'
            },
            timeout: 120000
        });

        return res.status(200).json({
            success: true,
            data: apiRes.data
        });

    } catch (err) {
        return res.status(err.response?.status || 500).json({
            success: false,
            message: err.response?.data?.message || err.message
        });
    }
};
