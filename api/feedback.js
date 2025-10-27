const { MongoClient } = require('mongodb');

let cachedClient = null;

async function connectToDatabase(uri) {
    if (cachedClient) {
        return cachedClient;
    }

    try {
        const client = new MongoClient(uri, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000
        });

        await client.connect();
        cachedClient = client;
        return client;
    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw error;
    }
}

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type,Authorization');

    // Handle OPTIONS request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.error('MONGODB_URI is not set');
        return res.status(500).json({ error: 'Database configuration error' });
    }

    try {
        const client = await connectToDatabase(uri);
        const collection = client.db('jterminus').collection('feedback');

        const { name, email, message } = req.body;
        if (!name || !email || !message) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const feedback = {
            ...req.body,
            timestamp: new Date(),
            status: 'new'
        };

        const result = await collection.insertOne(feedback);
        
        res.status(200).json({
            success: true,
            id: result.insertedId
        });

    } catch (error) {
        console.error('Error handling feedback:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};