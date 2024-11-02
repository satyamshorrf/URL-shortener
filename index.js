// server.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const URL = require('./models/url');
const urlRoute = require("./routes/url"); // This seems unused, consider removing or using it
const { connectToMongoDB } = require('./connect');

const app = express();
const PORT = process.env.PORT || 3000;

// Use body-parser middleware to parse JSON request body
app.use(bodyParser.json());

// Connect to MongoDB
connectToMongoDB(process.env.MONGODB_URI || 'mongodb://localhost:27017/urlshortener', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Generate a new short URL
app.post('/shorten', async (req, res) => {
    const { url } = req.body;
    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    // Optional: Validate URL Format
    const urlPattern = new RegExp('^(https?://)?([a-z0-9.-]+)\.([a-z]{2,6})[/\w.-]*$');
    if (!urlPattern.test(url)) {
        return res.status(400).json({ error: 'Invalid URL format' });
    }

    try {
        const newURL = await URL.create({ redirectURL: url });
        return res.status(201).json({ shortId: newURL.shortId, redirectURL: newURL.redirectURL });
    } catch (error) {
        console.error('Error creating new short URL:', error);
        return res.status(500).json({ error: 'An error occurred while creating the short URL' });
    }
});

// Redirect to the original URL
app.get('/:shortId', async (req, res) => {
    const { shortId } = req.params;

    try {
        const urlEntry = await URL.findOne({ shortId });
        if (!urlEntry) {
            return res.status(404).json({ error: 'URL not found' });
        }

        // Update visit history
        urlEntry.visitHistory.push({ timestamp: Date.now() });
        await urlEntry.save();

        return res.redirect(urlEntry.redirectURL);
    } catch (error) {
        console.error('Error retrieving URL:', error);
        return res.status(500).json({ error: 'An error occurred while retrieving the URL' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
