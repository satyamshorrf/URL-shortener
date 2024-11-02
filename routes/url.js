const express = require('express');
const { handleGenerateNewShortURL } = require("../controllers/url");
const { handleRedirect } = require('../controllers/url');

const router = express.Router();

router.post("/", handleGenerateNewShortURL, handleRedirect);

module.exports = router;