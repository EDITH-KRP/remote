const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const adminController = require('../controllers/adminController');
const { authMiddleware } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });


router.use(authMiddleware);

// Categories - accessible to ALL authenticated users for the raise ticket form
router.get('/categories', adminController.handleCategories);
router.get('/sub-categories', adminController.handleSubCategories);

router.post('/create', upload.single('attachment'), ticketController.createTicket);
router.get('/activity', ticketController.getActivity);
router.get('/assigned', ticketController.getAssignedTickets);
router.get('/', ticketController.getTickets);
router.get('/:id', ticketController.getTicketById);
router.put('/:id', ticketController.updateTicket);
router.get('/:id/comments', ticketController.getComments);
router.post('/:id/comments', ticketController.createComment);
router.post('/:id/feedback', ticketController.submitFeedback);
router.delete('/:id', ticketController.deleteTicket);

module.exports = router;
