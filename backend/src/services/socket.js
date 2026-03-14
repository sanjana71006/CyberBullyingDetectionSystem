import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import User from '../models/User.js';
import Message from '../models/Message.js';
import ModerationLog from '../models/ModerationLog.js';
import Violation from '../models/Violation.js';

const ML_API_URL = process.env.ML_API_URL || 'http://localhost:8000/predict';
const VIOLATION_THRESHOLD = 3;

const isCyberbullyingPrediction = (prediction, category) => {
  if (Number(prediction) === 1) return true;
  if (typeof prediction === 'string' && prediction.trim().toLowerCase() === 'cyberbullying') return true;
  if (typeof category === 'string' && category.trim().toLowerCase() === 'cyberbullying') return true;
  return false;
};

/**
 * Generates a context-aware, constructive rewrite of a toxic message.
 * Analyzes the original text to produce a relevant polite alternative.
 */
function generateRewrite(originalText, abusiveWords = []) {
  const text = originalText.trim();
  const lower = text.toLowerCase();

  // Strip flagged words to get the "topic" of the message
  const cleanedWords = text
    .split(/\s+/)
    .filter(w => !abusiveWords.some(bad => w.toLowerCase().includes(bad.toLowerCase())));
  const topic = cleanedWords.join(' ').trim();

  // ── Pattern: question form ──────────────────────────────
  if (lower.startsWith('why') || lower.startsWith('how') || lower.startsWith('what')) {
    return `Could you help me understand ${topic || 'this situation'}? I'd appreciate a thoughtful response.`;
  }

  // ── Pattern: "you are / you're [insult]" ────────────────
  if (/\b(you are|you're|ur|u r)\b/.test(lower)) {
    const afterYou = text.replace(/\b(you are|you're|ur|u r)\b/i, '').replace(new RegExp(abusiveWords.join('|'), 'gi'), '').trim();
    if (afterYou.length > 2) {
      return `I disagree with the way ${topic || 'things'} were handled. Can we talk about this calmly?`;
    }
    return `I'd like to express my disagreement respectfully. Can we discuss this further?`;
  }

  // ── Pattern: "I hate / I can't stand" ───────────────────
  if (/\b(i hate|i can't stand|i dislike|i despise)\b/.test(lower)) {
    const subject = text.replace(/\b(i hate|i can't stand|i dislike|i despise)\b/i, '').replace(new RegExp(abusiveWords.join('|'), 'gi'), '').trim();
    return subject
      ? `I find it difficult to appreciate ${subject}. Could we explore a better way to address this?`
      : `I have strong feelings about this. Let's find a constructive way to discuss it.`;
  }

  // ── Pattern: imperative / go away type ──────────────────
  if (/^(go|shut|stop|leave|get out|get lost|back off)/i.test(lower)) {
    return `I need some space right now. I'd appreciate if we could talk about this later when things are calmer.`;
  }

  // ── Pattern: short (< 5 words) with abusive word ────────
  if (text.split(/\s+/).length < 5) {
    return `I'm frustrated, but let me express that more constructively. Can we have a respectful conversation?`;
  }

  // ── Default: replace abusive words, keep structure ──────
  const sanitized = text.replace(new RegExp(abusiveWords.join('|'), 'gi'), '[concern]').replace(/\s+/g, ' ');
  return sanitized.length > 10
    ? `${sanitized} — I'd like to say this more respectfully and keep our conversation constructive.`
    : `I disagree with this, but let's keep our conversation constructive and respectful.`;
}



export const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: '*', // For development, allow all origins
      methods: ['GET', 'POST'],
    },
  });

  // Middleware for socket authentication
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error: Token missing'));
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }
      
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.username} (${socket.user._id})`);
    
    // Join a room with the user's ID
    socket.join(socket.user._id.toString());

    socket.on('send_message', async (data, callback) => {
      try {
        const { receiverId, text } = data;
        const senderId = socket.user._id;

        // 1. Call Python ML API
        let prediction = 0, confidence = 0, toxicityScore = 0, abusiveWords = [], predictionCategory = null;
        try {
          const mlResponse = await axios.post(ML_API_URL, { text });
          const mlData = mlResponse.data;
          prediction = mlData.prediction;
          confidence = mlData.confidence;
          toxicityScore = mlData.toxicity_score;
          abusiveWords = mlData.abusive_words;
          predictionCategory = mlData.category || mlData.label || null;
        } catch (mlError) {
          console.error('ML API Error:', mlError.message);
          // Fallback or handle gracefully, assuming safe if API is down
        }

        const isBullying = isCyberbullyingPrediction(prediction, predictionCategory);
        const sender = await User.findById(senderId);

        // 2. Base Message Creation (will save later based on logic)
        const messageDoc = new Message({
          senderId,
          receiverId,
          text,
          prediction,
          confidence,
          toxicityScore,
          abusiveWords,
          violationFlag: isBullying,
        });

        // 3. Logic: Safe vs Bullying
        if (!isBullying) {
          // Safe message
          sender.credibilityScore = Math.min(100, sender.credibilityScore + 1);
          await sender.save();
          
          const savedMessage = await messageDoc.save();

          // Send to receiver
          io.to(receiverId.toString()).emit('receive_message', savedMessage);
          
          // Ack to sender
          if (callback) callback({ status: 'sent', message: savedMessage });
        } else {
          // Bullying message
          sender.credibilityScore = Math.max(0, sender.credibilityScore - 10);
          await sender.save();
          messageDoc.isDelivered = false;
          
          // Record violation
          const violation = await Violation.create({
            user: senderId,
            type: 'Cyberbullying',
            severity: Math.ceil(toxicityScore * 10),
            description: `Sent toxic message containing: ${abusiveWords.join(', ')}`,
          });
          
          messageDoc.save().then(msg => {
            violation.relatedMessage = msg._id;
            violation.save();
          });

          // Check violations threshold
          const userViolationsCount = await Violation.countDocuments({ user: senderId });
          
          if (userViolationsCount >= VIOLATION_THRESHOLD) {
            // Forward to admin
            await ModerationLog.create({
              user: senderId,
              actionTaken: 'Credibility Reduced',
              reason: `Exceeded violation threshold (${userViolationsCount} violations)`,
            });
            // Optionally emit admin alert logic here
          }
          
          // Emit warning to sender with a dynamic suggested rewrite
          socket.emit('warning', {
            message: 'Warning: Your message may contain abusive language. It has not been delivered and your credibility score was reduced.',
            toxicityScore,
            abusiveWords,
            suggestedRewrite: generateRewrite(text, abusiveWords),
          });

          if (callback) callback({ status: 'blocked', reason: 'cyberbullying_detected' });
        }
      } catch (error) {
        console.error('Socket send_message error:', error);
        if (callback) callback({ status: 'error', reason: error.message });
      }
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.username}`);
    });
  });
};
