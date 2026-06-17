export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { email } = req.body;

    if (!email || !email.includes('@')) {
        return res.status(400).json({ error: 'A valid email address is required.' });
    }

    try {
        // Pull your Kit credentials securely from Vercel Environment Variables
        const KIT_FORM_ID = process.env.KIT_FORM_ID;
        const KIT_API_KEY = process.env.KIT_API_KEY; 
        
        const url = `https://api.convertkit.com/v3/forms/${KIT_FORM_ID}/subscribe`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                api_key: KIT_API_KEY,
                email: email
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Subscription failed at Kit');
        }

        return res.status(200).json({ success: true });

    } catch (error) {
        console.error('Kit API Error:', error);
        return res.status(500).json({ error: 'Failed to subscribe. Please try again.' });
    }
}
