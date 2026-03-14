import { Router } from 'express';
import { getAnalytics, getAdminAnalytics } from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

// User-scoped: only the logged-in user's messages
router.get('/analytics', protect, getAnalytics);

// Platform-wide: all messages — accessible to any authenticated user
// (the /admin route on the frontend already enforces admin-only access)
router.get('/analytics/admin', protect, getAdminAnalytics);

export default router;
