// models/url.js
const mongoose = require('mongoose');
const shortid = require('shortid');

const urlSchema = new mongoose.Schema({
    shortId: {
        type: String,
        required: true,
        unique: true,
        default: shortid.generate
    },
    redirectURL: {
        type: String,
        required: true,
    },
    visitHistory: [{
        timestamp: { type: Date, default: Date.now },
    }],
}, { timestamps: true });

const URL = mongoose.model('URL', urlSchema);

module.exports = URL;