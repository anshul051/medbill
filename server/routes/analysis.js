const express = require('express');
const router = express.Router();
const multer = require('multer');
const axios = require('axios');
const authMiddleware = require('../middleware/auth');
const Analysis = require('../models/Analysis');

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'image/heic', 'application/pdf'];
    allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('Invalid file type'));
  },
});

const ANALYSIS_PROMPT = `You are an expert medical document analyzer. Carefully read this document — it may be a PRESCRIPTION, LAB REPORT, BLOOD TEST, PATHOLOGY REPORT, DISCHARGE SUMMARY, or MEDICAL BILL.

Determine the document type and extract ALL information. Return ONLY a single valid JSON object with NO markdown, NO explanation:

{
  "document_type": "prescription|lab_report|blood_test|discharge_summary|medical_bill|other",
  "patient_name": null,
  "patient_age": null,
  "patient_gender": null,
  "doctor_name": null,
  "hospital": null,
  "date": null,
  "diagnosis": null,
  "medicines": [
    {
      "name": "MedicineName",
      "generic_name": null,
      "category": "Antibiotic",
      "purpose": "treats infection",
      "dosage": "500mg",
      "frequency": "Twice daily",
      "duration": "5 days",
      "form": "Tablet",
      "timing": ["Morning - 8:00 AM", "Night - 9:00 PM"],
      "instructions": "Take after food",
      "warnings": []
    }
  ],
  "lab_results": [
    {
      "test_name": "Hemoglobin",
      "value": "11.2",
      "unit": "g/dL",
      "normal_range": "12.0-16.0",
      "status": "low|normal|high|borderline",
      "interpretation": "Slightly below normal, mild anemia"
    }
  ],
  "vitals": {
    "blood_pressure": null,
    "pulse": null,
    "temperature": null,
    "weight": null,
    "height": null,
    "bmi": null,
    "oxygen_saturation": null
  },
  "general_instructions": null,
  "follow_up": null,
  "total_amount": null,
  "summary": "One sentence plain-English summary of the document"
}

Rules:
- Return ONLY the JSON. No other text.
- For prescriptions: fill medicines array fully, leave lab_results as []
- For lab reports: fill lab_results fully with status (low/normal/high/borderline), leave medicines as []
- For discharge summaries: fill both medicines and lab_results if present
- Mark abnormal lab values clearly in status field
- If not a medical document at all: {"error":"Not a medical document"}`;

function extractJSON(raw) {
  try { return JSON.parse(raw.trim()); } catch (e) {}
  const stripped = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  try { return JSON.parse(stripped); } catch (e) {}
  const m = raw.match(/\{[\s\S]*\}/);
  if (m) { try { return JSON.parse(m[0]); } catch (e) {} }
  throw new Error('Could not parse AI response as JSON');
}

// @POST /api/analysis/analyze
router.post('/analyze', authMiddleware, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  const apiKey = req.user.groqApiKey || process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(400).json({ message: 'Groq API key not set. Add it in your profile.' });

  try {
    const base64 = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype;
    const imageUrl = `data:${mimeType};base64,${base64}`;

    const groqRes = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        messages: [{
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: imageUrl } },
            { type: 'text', text: ANALYSIS_PROMPT },
          ],
        }],
        max_tokens: 2048,
        temperature: 0.1,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        timeout: 60000,
      }
    );

    const rawText = groqRes.data.choices?.[0]?.message?.content;
    if (!rawText) throw new Error('Empty response from Groq');

    const parsed = extractJSON(rawText);
    if (parsed.error) return res.status(422).json({ message: parsed.error });

    const analysis = await Analysis.create({
      user: req.user._id,
      fileName: req.file.originalname,
      ...parsed,
    });

    res.status(201).json({ analysis });
  } catch (err) {
    console.error('Analysis error:', err.response?.data || err.message);
    const msg = err.response?.data?.error?.message || err.message;
    res.status(500).json({ message: msg });
  }
});

// @POST /api/analysis/chat
router.post('/chat', authMiddleware, async (req, res) => {
  const { messages, analysisId } = req.body;
  const apiKey = req.user.groqApiKey || process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(400).json({ message: 'Groq API key not set' });

  let contextStr = '';
  if (analysisId) {
    const analysis = await Analysis.findOne({ _id: analysisId, user: req.user._id });
    if (analysis) {
      contextStr = `Document type: ${analysis.document_type}. Diagnosis: ${analysis.diagnosis || 'N/A'}. `
        + `Medicines: ${(analysis.medicines || []).map((m) => `${m.name} ${m.dosage || ''} ${m.frequency || ''}`).join('; ')}. `
        + `Lab results: ${(analysis.lab_results || []).map((l) => `${l.test_name} ${l.value} ${l.unit} (${l.status})`).join('; ')}`;
    }
  }

  try {
    const groqRes = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `You are a friendly medical assistant. Explain medicines, lab results, normal ranges, and general health advice. Always recommend consulting a doctor for diagnosis. Context: ${contextStr}`,
          },
          ...messages.map((m) => ({ role: m.role, content: m.content })),
        ],
        max_tokens: 1024,
        temperature: 0.3,
      },
      {
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        timeout: 30000,
      }
    );
    const reply = groqRes.data.choices?.[0]?.message?.content || 'Sorry, no response.';
    res.json({ reply });
  } catch (err) {
    res.status(500).json({ message: err.response?.data?.error?.message || err.message });
  }
});

// @GET /api/analysis  — get all analyses for user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const analyses = await Analysis.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .select('document_type patient_name diagnosis summary createdAt fileName');
    res.json({ analyses });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @GET /api/analysis/:id
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const analysis = await Analysis.findOne({ _id: req.params.id, user: req.user._id });
    if (!analysis) return res.status(404).json({ message: 'Analysis not found' });
    res.json({ analysis });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @DELETE /api/analysis/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await Analysis.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
