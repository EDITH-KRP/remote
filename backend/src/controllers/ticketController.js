const { Ticket, TicketLog, User, Category, Feedback } = require('../models');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_SERVER || 'smtp.gmail.com',
  port: process.env.MAIL_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD
  }
});

exports.createTicket = async (req, res) => {
  try {
    const { category_id, subject, description, priority } = req.body;
    const ticket_number = `TKT-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    
    const ticket = await Ticket.create({
      ticket_number,
      user_id: req.userId,
      category_id,
      subject,
      description,
      priority: priority || 'Low'
    });

    await TicketLog.create({
      ticket_id: ticket.id,
      action: 'Ticket Created',
      performed_by: req.userId
    });

    // Send Email Alert
    const user = await User.findByPk(req.userId);
    if (user && process.env.MAIL_USERNAME) {
      transporter.sendMail({
        from: process.env.MAIL_DEFAULT_SENDER || process.env.MAIL_USERNAME,
        to: user.email,
        subject: `Ticket Created: ${ticket_number}`,
        html: `<h3>Your support request has been received!</h3><p><strong>Ticket Number:</strong> ${ticket_number}</p><p><strong>Subject:</strong> ${subject}</p><p>Our support team will review it shortly.</p>`
      }).catch(err => console.error("Email error:", err));
    }

    res.status(201).json(ticket);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getTickets = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId);
    let tickets;

    const include = [
      { model: User, as: 'author', attributes: ['full_name'] },
      { model: User, as: 'assigned_staff', attributes: ['full_name'] },
      { model: Category, as: 'category' }
    ];

    if (user.role === 'admin') {
      tickets = await Ticket.findAll({ include });
    } else if (user.role === 'support') {
      tickets = await Ticket.findAll({ where: { assigned_staff_id: user.id }, include });
    } else {
      tickets = await Ticket.findAll({ where: { user_id: user.id }, include });
    }

    const formatted = tickets.map(t => {
      const json = t.toJSON();
      return {
        ...json,
        author_name: json.author?.full_name,
        assigned_staff_name: json.assigned_staff?.full_name,
        category_name: json.category?.category_name
      };
    });

    res.status(200).json(formatted);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id, {
      include: [
        { model: TicketLog, as: 'logs' },
        { model: Feedback, as: 'feedback' }
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
        ticket_id: ticket.id,
        action: `Status changed to ${status}`,
        performed_by: req.userId
      });

      // If resolved, notify user
      if (status === 'Resolved' && process.env.MAIL_USERNAME) {
        const author = await User.findByPk(ticket.user_id);
        transporter.sendMail({
          from: process.env.MAIL_DEFAULT_SENDER || process.env.MAIL_USERNAME,
          to: author.email,
          subject: `Ticket Resolved: ${ticket.ticket_number}`,
          html: `<h3>Your ticket has been marked as resolved!</h3><p>Please log in to leave feedback.</p>`
        }).catch(err => console.error("Email error:", err));
      }
    }

    if (assigned_staff_id) {
      ticket.assigned_staff_id = assigned_staff_id;
      await TicketLog.create({
        ticket_id: ticket.id,
        action: `Assigned to user ${assigned_staff_id}`,
        performed_by: req.userId
      });
    }

    await ticket.save();
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

    const feedback = await Feedback.create({
      ticket_id: ticket.id,
      rating,
      comments
    });

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

    await ticket.destroy();
    res.status(200).json({ message: 'Ticket deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
