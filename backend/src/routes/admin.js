const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/users', adminController.getUsers);
router.patch('/users/:id/role', adminController.updateUserRole);
router.patch('/users/:id/department', adminController.updateUserDepartment);
router.post('/assign-ticket', adminController.assignTicket);
router.get('/reports', adminController.getReports);
router.get('/activity', adminController.getActivity);
router.get('/export', adminController.exportTickets);
router.get('/available-staff', adminController.getAvailableStaff);
router.get('/categories', adminController.handleCategories);
router.post('/categories', adminController.handleCategories);
router.get('/sub-categories', adminController.handleSubCategories);
router.post('/sub-categories', adminController.handleSubCategories);

module.exports = router;
