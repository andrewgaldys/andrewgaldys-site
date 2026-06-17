export default async function handler(req, res) {
    // 1. Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { email } = req.body;

    // 2. Validate email
    if (!email || !email.includes('@')) {
        return res.status(400).json({ error: 'A valid email address is required.' });
    }

    try {
        // 3. Connect to beehiiv
        const BEEHIIV_PUB_ID = process.env.BEEHIIV_PUB_ID;
        const BEEHIIV_API_KEY = process.env.BEEHIIV_API_KEY;
        const url = `https://api.beehiiv.com/v2/publications/${BEEHIIV_PUB_ID}/subscriptions`;

        // We use native global fetch available in modern Node/Vercel
        const response = await fetch(url, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${BEEHIIV_API_KEY}`
            },
            body: JSON.stringify({
                email: email,
                reactivate_existing: true, // Re-subscribes them if they left previously
                send_welcome_email: true,  // CRITICAL: This triggers your automated video email!
                utm_source: "andrewgaldys.com",
                utm_campaign: "investing_101_funnel"
            })
        });

        const data = await response.json();

        // 4. Handle beehiiv errors (e.g., API key wrong, duplicate limits)
        if (!response.ok) {
            throw new Error(data.message || 'Subscription failed at beehiiv');
        }

        // 5. Send success back to your frontend
        return res.status(200).json({ success: true });

    } catch (error) {
        console.error('beehiiv API Error:', error);
        return res.status(500).json({ error: 'Failed to subscribe. Please try again.' });
    }
}
