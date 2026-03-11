const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Reminder = require('../models/Reminder');

// @GET /api/reminders
router.get('/', authMiddleware, async (req, res) => {
  try {
    const reminders = await Reminder.find({ user: req.user._id }).populate('analysis', 'diagnosis fileName');
    res.json({ reminders });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @POST /api/reminders
router.post('/', authMiddleware, async (req, res) => {
  const { analysisId, medicineName, dosage, timings } = req.body;
  try {
    const reminder = await Reminder.create({
      user: req.user._id,
      analysis: analysisId,
      medicineName,
      dosage,
      timings,
      isActive: true,
    });
    res.status(201).json({ reminder });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @PUT /api/reminders/:id/toggle
router.put('/:id/toggle', authMiddleware, async (req, res) => {
  try {
    const reminder = await Reminder.findOne({ _id: req.params.id, user: req.user._id });
    if (!reminder) return res.status(404).json({ message: 'Reminder not found' });
    reminder.isActive = !reminder.isActive;
    await reminder.save();
    res.json({ reminder });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @DELETE /api/reminders/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await Reminder.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ message: 'Reminder deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
