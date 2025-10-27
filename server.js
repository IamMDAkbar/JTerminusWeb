require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;
const DATABASE_URL = process.env.MONGODB_URI || process.env.DATABASE_URL;

// Basic error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Middleware
app.use(cors());
app.use(express.json());

// Set up static file serving
app.use('/', express.static(__dirname));

// Default route - serve the HTML file
app.get('/', function(req, res) {
    console.log('Serving HTML file from:', path.join(__dirname, 'index.html'));
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Test MongoDB connection
app.get('/api/test', async (req, res) => {
    try {
        await connectDB();
        res.json({ status: 'success', message: 'MongoDB connection successful' });
    } catch (error) {
        console.error('MongoDB test connection error:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// MongoDB connection
const uri = DATABASE_URL;
if (!uri) {
    console.error('DATABASE_URL or MONGODB_URI is not set in environment variables');
    process.exit(1);
}

console.log('Attempting to connect to MongoDB...');
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 10
});

// Database and collection names
const dbName = 'jterminus';
const collectionName = 'feedback';

async function connectDB() {
    try {
        await client.connect();
        console.log('Connected to MongoDB Atlas');
        return client.db(dbName).collection(collectionName);
    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw error;
    }
}

// API Routes
app.post('/api/feedback', async (req, res) => {
    console.log('Received feedback request:', req.body);
    try {
        const collection = await connectDB();
        console.log('Connected to MongoDB successfully');
        
        // Validate required fields
        const { name, email, message } = req.body;
        if (!name || !email || !message) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Add timestamp and insert into MongoDB
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
        console.error('Error submitting feedback:', error);
        res.status(500).json({ 
            error: 'Failed to submit feedback',
            details: error.message
        });
    }
});

// Start server
const server = app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`Serving files from: ${__dirname}`);
});

// Handle server errors
server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`Port ${port} is already in use. Please try a different port.`);
    } else {
        console.error('Server error:', error);
    }
    process.exit(1);
});