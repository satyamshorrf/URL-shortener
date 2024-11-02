const shortid = require('shortid');
const URL = require('../models/url'); // Adjust the path as necessary

// Controller to handle generating a new short URL
async function handleGenerateNewShortURL(req, res) {
    const body = req.body;
    if (!body.url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    const shortID = shortid.generate();

    try {
        const newURL = await URL.create({
            shortId: shortID,
            redirectURL: body.url,
            visitHistory: [],
        });

        return res.status(201).json({ shortId: newURL.shortId, redirectURL: newURL.redirectURL });
    } catch (error) {
        console.error('Error creating new short URL:', error);
        return res.status(500).json({ error: 'An error occurred while creating the short URL' });
    }
}

// Controller to handle redirecting to the original URL
async function handleRedirect(req, res) {
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
}

module.exports = {
    handleGenerateNewShortURL,
    handleRedirect,
};