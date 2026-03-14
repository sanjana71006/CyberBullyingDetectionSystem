import express from 'express';
import { getUsers, getModerationLogs, suspendUser, getUserViolations } from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/users', protect, admin, getUsers);
router.get('/logs', protect, admin, getModerationLogs);
router.get('/users/:id/violations', protect, admin, getUserViolations);
router.post('/users/:id/suspend', protect, admin, suspendUser);

export default router;
