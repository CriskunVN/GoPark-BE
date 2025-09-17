import express from 'express';
import * as adminController from '../controllers/admin.controller.js';
import * as authController from '../controllers/auth.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Test route không cần auth
router.get('/test', (req, res) => {
  res.json({
    message: 'Admin routes working!',
    timestamp: new Date().toISOString(),
  });
});

// Protect all routes after this middleware
router.use(protect);
router.use(restrictTo('admin'));
// Dashboard routes
router.get('/dashboard/stats', adminController.getDashboardStats);
router.get('/dashboard/activities', adminController.getRecentActivities);
router.get('/dashboard/system-status', adminController.getSystemStatus);

export default router;
