import { Router } from 'express';
import { analyzeText, analyzeVoice, analyzeVoiceText, saveAnalysis, voiceUploadMiddleware } from '../controllers/analyzeController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

// /analyze is public so unauthenticated users can still demo the tool
router.post('/analyze', analyzeText);

// /analyzeVoice – server-side Whisper STT on audio upload
router.post('/analyzeVoice', voiceUploadMiddleware, analyzeVoice);

// /analyzeVoiceText – Web Speech API already transcribed the audio on the client
router.post('/analyzeVoiceText', analyzeVoiceText);

// /save requires auth so the message is linked to the logged-in user
router.post('/save', protect, saveAnalysis);

export default router;
