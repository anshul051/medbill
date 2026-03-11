const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Analysis = require('../models/Analysis');

function genCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// @POST /api/share/generate/:analysisId
router.post('/generate/:analysisId', authMiddleware, async (req, res) => {
  try {
    const analysis = await Analysis.findOne({ _id: req.params.analysisId, user: req.user._id });
    if (!analysis) return res.status(404).json({ message: 'Analysis not found' });
    const code = genCode();
    analysis.shareCode = code;
    await analysis.save();
    res.json({ shareCode: code });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @GET /api/share/:code  — public, no auth needed
router.get('/:code', async (req, res) => {
  try {
    const analysis = await Analysis.findOne({ shareCode: req.params.code.toUpperCase() });
    if (!analysis) return res.status(404).json({ message: 'Share code not found' });
    res.json({ analysis });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
