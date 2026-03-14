import User from '../models/User.js';
import ModerationLog from '../models/ModerationLog.js';
import Violation from '../models/Violation.js';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';

// @desc    Get all users (for admin dashboard)
// @route   GET /api/admin/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    
    // Aggregate activity stats for each user (for Admin Dashboard)
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const postsCount = await Post.countDocuments({ author: user._id });
        const commentsCount = await Comment.countDocuments({ author: user._id });
        const violationsCount = await Violation.countDocuments({ user: user._id });

        return {
          ...user.toObject(),
          postsCount,
          commentsCount,
          violationsCount,
        };
      })
    );

    res.json(usersWithStats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get moderation logs
// @route   GET /api/admin/logs
// @access  Private/Admin
export const getModerationLogs = async (req, res) => {
  try {
    const logs = await ModerationLog.find({})
      .populate('user', 'username email')
      .populate('relatedMessage', 'text')
      .sort({ createdAt: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get violations for a user
// @route   GET /api/admin/users/:id/violations
// @access  Private/Admin
export const getUserViolations = async (req, res) => {
  try {
    const violations = await Violation.find({ user: req.params.id })
      .populate('relatedMessage', 'text')
      .sort({ createdAt: -1 });
    res.json(violations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Suspend a user
// @route   POST /api/admin/users/:id/suspend
// @access  Private/Admin
export const suspendUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.isSuspended = true;
    user.suspensionReason = req.body.reason || 'Account suspended manually by Admin.';
    await user.save();

    await ModerationLog.create({
      user: user._id,
      actionTaken: 'Account Suspended',
      reason: user.suspensionReason,
      admin: req.user._id,
    });

    res.json({ message: 'User suspended successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
