const { Ticket, TicketLog, User, Category, Feedback, Notification, TicketComment } = require('../models');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_SERVER || 'smtp.gmail.com',
  port: process.env.MAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD
  }
});

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Emit a 'tickets:update' event so all connected clients refresh their lists. */
const emitTicketsUpdate = (req, payload = {}) => {
  const io = req.app.locals.io;
  if (io) io.emit('tickets:update', payload);
};

/** Build a formatted ticket object (same shape as getTickets). */
const formatTicket = (t) => {
  const json = t.toJSON ? t.toJSON() : t;
  return {
    ...json,
    author_name:          json.author?.full_name,
    assigned_staff_name:  json.assigned_staff?.full_name,
    category_name:        json.category?.category_name,
  };
};

// ── Controllers ───────────────────────────────────────────────────────────────

exports.createTicket = async (req, res) => {
  try {
    const { category_id, subject, description, priority } = req.body;
    const ticket_number = `TKT-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    let attachment_url = null;
    if (req.file) {
      attachment_url = `/uploads/${req.file.filename}`;
    }

    const ticket = await Ticket.create({
      ticket_number,
      user_id:     req.userId,
      category_id,
      subject,
      description,
      priority: priority || 'Low',
      attachment_url
    });

    await TicketLog.create({
      ticket_id:    ticket.id,
      action:       'Ticket Created',
      performed_by: req.userId
    });

    // Send Email Alert
    const user = await User.findByPk(req.userId);
    if (user && process.env.MAIL_USERNAME) {
      transporter.sendMail({
        from:    process.env.MAIL_DEFAULT_SENDER || process.env.MAIL_USERNAME,
        to:      user.email,
        subject: `Ticket Created: ${ticket_number}`,
        html:    `<h3>Your support request has been received!</h3><p><strong>Ticket Number:</strong> ${ticket_number}</p><p><strong>Subject:</strong> ${subject}</p><p>Our support team will review it shortly.</p>`
      }).catch(err => console.error('Email error:', err));
    }

    // 🔴 Real-time: broadcast new ticket to all clients
    emitTicketsUpdate(req, { event: 'created', ticketId: ticket.id });

    res.status(201).json(ticket);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getComments = async (req, res) => {
  try {
    const comments = await TicketComment.findAll({
      where: { ticket_id: req.params.id },
      include: [{ model: User, as: 'author', attributes: ['id', 'full_name', 'role'] }],
      order: [['created_at', 'ASC']]
    });
    // Filter internal comments if user is not support/admin
    const user = await User.findByPk(req.userId);
    if (user.role === 'user') {
      return res.status(200).json(comments.filter(c => !c.is_internal));
    }
    res.status(200).json(comments);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createComment = async (req, res) => {
  try {
    const { body, is_internal } = req.body;
    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    
    const user = await User.findByPk(req.userId);
    
    // Create comment
    const comment = await TicketComment.create({
      ticket_id: ticket.id,
      author_id: req.userId,
      body,
      is_internal: user.role !== 'user' ? (is_internal || false) : false
    });

    const fullComment = await TicketComment.findByPk(comment.id, {
      include: [{ model: User, as: 'author', attributes: ['id', 'full_name', 'role'] }]
    });

    // Notify ticket owner if support replies
    if (user.id !== ticket.user_id && !comment.is_internal) {
      await Notification.create({
        user_id: ticket.user_id,
        message: `New reply on ticket ${ticket.ticket_number}`
      });
      const io = req.app.locals.io;
      if (io) {
        io.emit(`notification:${ticket.user_id}`, { message: `New reply on ticket ${ticket.ticket_number}` });
      }
    }

    // Notify assigned staff if user replies
    if (user.id === ticket.user_id && ticket.assigned_staff_id) {
       await Notification.create({
        user_id: ticket.assigned_staff_id,
        message: `User replied to ticket ${ticket.ticket_number}`
      });
      const io = req.app.locals.io;
      if (io) {
        io.emit(`notification:${ticket.assigned_staff_id}`, { message: `User replied to ticket ${ticket.ticket_number}` });
      }
    }

    res.status(201).json(fullComment);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getActivity = async (req, res) => {
  try {
    const range = parseInt(req.query.range) || 7;
    const date = new Date();
    date.setDate(date.getDate() - range);
    
    const { Op } = require('sequelize');
    const user = await User.findByPk(req.userId);
    
    const whereCreated = { created_at: { [Op.gte]: date } };
    const whereResolved = { status: ['Resolved', 'Closed'], updated_at: { [Op.gte]: date } };

    if (user.role !== 'admin') {
      whereCreated.user_id = user.id;
      whereResolved.user_id = user.id;
    }

    const tickets = await Ticket.findAll({ where: whereCreated });
    const resolved = await Ticket.findAll({ where: whereResolved });

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    const activityMap = {};
    for (let i = range - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStr = days[d.getDay()];
      activityMap[d.toDateString()] = { day: dayStr, created: 0, resolved: 0, dateObj: d.toDateString() };
    }

    tickets.forEach(t => {
      const dStr = new Date(t.createdAt || t.created_at).toDateString();
      if (activityMap[dStr]) activityMap[dStr].created++;
    });

    resolved.forEach(t => {
      const dStr = new Date(t.updatedAt || t.updated_at).toDateString();
      if (activityMap[dStr]) activityMap[dStr].resolved++;
    });

    const activityData = Object.values(activityMap);
    
    res.status(200).json(activityData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getTickets = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId);
    let tickets;

    const include = [
      { model: User,     as: 'author',         attributes: ['full_name'] },
      { model: User,     as: 'assigned_staff',  attributes: ['full_name'] },
      { model: Category, as: 'category' }
    ];

    if (user.role === 'admin') {
      tickets = await Ticket.findAll({ include, order: [['created_at', 'DESC']] });
    } else if (user.role === 'support') {
      tickets = await Ticket.findAll({ where: { assigned_staff_id: user.id }, include, order: [['created_at', 'DESC']] });
    } else {
      tickets = await Ticket.findAll({ where: { user_id: user.id }, include, order: [['created_at', 'DESC']] });
    }

    res.status(200).json(tickets.map(formatTicket));
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id, {
      include: [
        { model: TicketLog, as: 'logs' },
        { model: Feedback,  as: 'feedback' }
      ]
    });
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    res.status(200).json(ticket);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    const { status, assigned_staff_id } = req.body;

    if (status) {
      ticket.status = status;
      await TicketLog.create({
        ticket_id:    ticket.id,
        action:       `Status changed to ${status}`,
        performed_by: req.userId
      });

      // Notify user on resolution
      if (status === 'Resolved' && process.env.MAIL_USERNAME) {
        const author = await User.findByPk(ticket.user_id);
        transporter.sendMail({
          from:    process.env.MAIL_DEFAULT_SENDER || process.env.MAIL_USERNAME,
          to:      author.email,
          subject: `Ticket Resolved: ${ticket.ticket_number}`,
          html:    `<h3>Your ticket has been marked as resolved!</h3><p>Please log in to leave feedback.</p>`
        }).catch(err => console.error('Email error:', err));
      }
    }

    if (assigned_staff_id) {
      ticket.assigned_staff_id = assigned_staff_id;
      await TicketLog.create({
        ticket_id:    ticket.id,
        action:       `Assigned to user ${assigned_staff_id}`,
        performed_by: req.userId
      });
    }

    await ticket.save();

    // 🔴 Real-time: broadcast update to all clients
    emitTicketsUpdate(req, { event: 'updated', ticketId: ticket.id, status: ticket.status });

    res.status(200).json(ticket);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.submitFeedback = async (req, res) => {
  try {
    const { rating, comments } = req.body;
    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    if (ticket.user_id !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const feedback = await Feedback.create({ ticket_id: ticket.id, rating, comments });
    res.status(201).json(feedback);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteTicket = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId);
    if (user.role !== 'admin') return res.status(403).json({ message: 'Unauthorized' });

    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    const ticketId = ticket.id;
    await ticket.destroy();

    // 🔴 Real-time: broadcast deletion to all clients
    emitTicketsUpdate(req, { event: 'deleted', ticketId });

    res.status(200).json({ message: 'Ticket deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
