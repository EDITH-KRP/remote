const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const adminController = require('../controllers/adminController');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// Categories - accessible to ALL authenticated users for the raise ticket form
router.get('/categories', adminController.handleCategories);

router.post('/create', ticketController.createTicket);
router.get('/', ticketController.getTickets);
router.get('/:id', ticketController.getTicketById);
router.put('/:id', ticketController.updateTicket);
router.post('/:id/feedback', ticketController.submitFeedback);
router.delete('/:id', ticketController.deleteTicket);

module.exports = router;
