import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const AUTO_SUSPEND_CREDIBILITY_THRESHOLD = 20;

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');

      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({ error: 'Not authorized, user not found' });
      }

      if (!req.user.isSuspended && req.user.credibilityScore < AUTO_SUSPEND_CREDIBILITY_THRESHOLD) {
        req.user.isSuspended = true;
        req.user.suspensionReason = `Account blocked: credibility score is below ${AUTO_SUSPEND_CREDIBILITY_THRESHOLD}.`;
        await req.user.save();
      }

      if (req.user.isSuspended) {
        return res.status(403).json({
          error: 'account_suspended',
          message: req.user.suspensionReason || `Account blocked: credibility score is below ${AUTO_SUSPEND_CREDIBILITY_THRESHOLD}.`,
        });
      }

      next();
    } catch (error) {
      res.status(401).json({ error: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ error: 'Not authorized, no token' });
  }
};

export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Not authorized as an admin' });
  }
};
