const mongoose = require('mongoose');

const labResultSchema = new mongoose.Schema({
  test_name: String,
  value: String,
  unit: String,
  normal_range: String,
  status: { type: String, enum: ['low', 'normal', 'high', 'borderline'], default: 'normal' },
  interpretation: String,
});

const medicineSchema = new mongoose.Schema({
  name: String,
  generic_name: String,
  category: String,
  purpose: String,
  dosage: String,
  frequency: String,
  duration: String,
  form: String,
  timing: [String],
  instructions: String,
  warnings: [String],
});

const analysisSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    document_type: {
      type: String,
      enum: ['prescription', 'lab_report', 'blood_test', 'discharge_summary', 'medical_bill', 'other'],
      default: 'other',
    },
    patient_name: String,
    patient_age: String,
    patient_gender: String,
    doctor_name: String,
    hospital: String,
    date: String,
    diagnosis: String,
    medicines: [medicineSchema],
    lab_results: [labResultSchema],
    vitals: {
      blood_pressure: String,
      pulse: String,
      temperature: String,
      weight: String,
      height: String,
      bmi: String,
      oxygen_saturation: String,
    },
    general_instructions: String,
    follow_up: String,
    total_amount: String,
    summary: String,
    shareCode: { type: String, unique: true, sparse: true },
    fileName: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Analysis', analysisSchema);
