import Message from '../models/Message.js';
import { predictMessage, predictVoice, predictVoiceText } from '../services/mlClient.js';
import multer from 'multer';

// Configure multer for voice upload (memory storage to keep it fast)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit 
});

export const voiceUploadMiddleware = upload.single('audio');

export async function analyzeText(req, res) {
  const { text } = req.body;

  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'A valid text field is required.' });
  }

  try {
    const result = await predictMessage(text);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Analyze error:', error.message);
    return res.status(502).json({ error: 'ML service unavailable. Try again shortly.' });
  }
}

export async function saveAnalysis(req, res) {
  const { text, prediction, confidence, toxicityScore = 0, abusiveWords = [] } = req.body;

  if (!text || typeof prediction === 'undefined' || typeof confidence === 'undefined') {
    return res.status(400).json({ error: 'text, prediction, and confidence are required.' });
  }

  try {
    const saved = await Message.create({
      text,
      prediction,
      confidence,
      toxicityScore,
      abusiveWords,
      // Link to the authenticated user so analytics are user-scoped
      senderId: req.user?._id || null,
    });

    return res.status(201).json(saved);
  } catch (error) {
    console.error('Save error:', error.message);
    return res.status(500).json({ error: 'Failed to store analysis.' });
  }
}

export async function analyzeVoice(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'No audio file uploaded.' });
  }
  try {
    const result = await predictVoice(req.file.buffer, req.file.originalname);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Voice analyze error:', error.message);
    if (error.response?.data?.detail) {
      console.error('FastAPI Detail:', JSON.stringify(error.response.data.detail));
    }
    return res.status(502).json({ 
      error: 'Voice ML service unavailable. Make sure the Python ML server is running on port 8000.' 
    });
  }
}

export async function analyzeVoiceText(req, res) {
  const { transcription } = req.body;
  if (!transcription || typeof transcription !== 'string' || !transcription.trim()) {
    return res.status(400).json({ error: 'transcription field is required.' });
  }
  try {
    const result = await predictVoiceText(transcription);
    return res.status(200).json(result);
  } catch (error) {
    console.error('VoiceText analyze error:', error.message);
    return res.status(502).json({ 
      error: 'Voice analysis service unavailable. Make sure the Python ML server is running on port 8000.' 
    });
  }
}

