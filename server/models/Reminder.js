const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    analysis: { type: mongoose.Schema.Types.ObjectId, ref: 'Analysis', required: true },
    medicineName: { type: String, required: true },
    dosage: String,
    timings: [String],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Reminder', reminderSchema);
