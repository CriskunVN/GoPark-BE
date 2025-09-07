import catchAsync from '../utils/catchAsync.js';
import * as adminService from '../services/admin.service.js';

export const getDashboardStats = catchAsync(async (req, res, next) => {
  console.log('Admin getDashboardStats called by user:', req.user?.id);
  const stats = await adminService.getAdminDashboardStats();
  
  res.status(200).json({
    status: 'success',
    data: stats
  });
});

export const getRecentActivities = catchAsync(async (req, res, next) => {
  console.log('Admin getRecentActivities called');
  const limit = parseInt(req.query.limit) || 10;
  const activities = await adminService.getRecentActivities(limit);
  
  res.status(200).json({
    status: 'success',
    data: activities
  });
});

export const getSystemStatus = catchAsync(async (req, res, next) => {
  console.log('Admin getSystemStatus called');
  const systemStatus = await adminService.getSystemStatus();
  
  res.status(200).json({
    status: 'success',
    data: systemStatus
  });
});