import express from 'express';
import { createPost, getPosts, addComment, getComments } from '../controllers/socialController.js';
import { protect } from '../middleware/authMiddleware.js';
import User from '../models/User.js';
import Message from '../models/Message.js';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import Violation from '../models/Violation.js';

const router = express.Router();

router.route('/posts')
  .post(protect, createPost)
  .get(protect, getPosts);

router.route('/posts/:id/comments')
  .post(protect, addComment)
  .get(protect, getComments);

// GET /api/social/users - returns all ACTIVE (non-suspended) users except the logged-in one
router.get('/users', protect, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id }, isSuspended: false }).select('-password').sort({ username: 1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/social/messages/:userId - returns conversation history between the logged-in user and another user
router.get('/messages/:userId', protect, async (req, res) => {
  try {
    const { userId } = req.params;
    const myId = req.user._id;
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userId },
        { senderId: userId, receiverId: myId },
      ],
    }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/social/stats - real user activity stats for the personal dashboard
router.get('/stats', protect, async (req, res) => {
  try {
    const myId = req.user._id;

    const [postsCount, commentsCount, messagesCount, safeMessages, violationsCount] = await Promise.all([
      Post.countDocuments({ author: myId }),
      Comment.countDocuments({ author: myId }),
      Message.countDocuments({ $or: [{ senderId: myId }, { receiverId: myId }] }),
      Message.countDocuments({ senderId: myId, violationFlag: false }),
      Violation.countDocuments({ user: myId }),
    ]);

    const warnedMessages = await Message.countDocuments({ senderId: myId, violationFlag: true, isDelivered: false });
    const blockedMessages = Math.max(0, violationsCount - warnedMessages);

    // Build 7-day credibility snapshot using credibilityScore drift from violations
    // We use a simple approximation: show a downward curve if violations exist
    const today = new Date();
    const credibility = req.user.credibilityScore;
    const credibilityHistory = Array.from({ length: 7 }).map((_, i) => {
      const dayIndex = 6 - i;
      const dayLabel = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][new Date(today.getTime() - dayIndex * 86400000).getDay()];
      // Approximate past score based on violations
      const score = Math.min(100, Math.max(0, credibility + (dayIndex * 2) - (violationsCount * 3)));
      return { day: dayLabel, score };
    });

    res.json({
      postsCount,
      commentsCount,
      messagesCount,
      safeMessages,
      warnedMessages,
      blockedMessages: violationsCount,
      credibilityHistory,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;


