const { Ticket, TicketLog, User, Category } = require('../models');

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
    const ticket = await Ticket.findByPk(req.params.id);
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
