const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { Notification } = require('../models');

router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { user_id: req.userId },
      order: [['created_at', 'DESC']],
      limit: 20
    });
    res.status(200).json(notifications);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findByPk(req.params.id);
    if (!notification || notification.user_id !== req.userId) {
      return res.status(404).json({ message: 'Not found' });
    }
    notification.is_read = true;
    await notification.save();
    res.status(200).json(notification);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/read-all', async (req, res) => {
  try {
    await Notification.update({ is_read: true }, { where: { user_id: req.userId } });
    res.status(200).json({ message: 'All read' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
