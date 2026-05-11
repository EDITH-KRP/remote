const { Ticket, User, Category } = require('../models');

exports.getUsers = async (req, res) => {
  try {
    const users = await User.findAll({ attributes: { exclude: ['password_hash'] } });
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.assignTicket = async (req, res) => {
  try {
    const { ticket_id, staff_id } = req.body;
    const ticket = await Ticket.findByPk(ticket_id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    
    ticket.assigned_staff_id = staff_id;
    ticket.status = 'Assigned';
    await ticket.save();

    res.status(200).json({ message: 'Ticket assigned successfully', ticket });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getReports = async (req, res) => {
  try {
    const total_tickets = await Ticket.count();
    const open_tickets = await Ticket.count({ where: { status: 'Open' } });
    const resolved_tickets = await Ticket.count({ where: { status: 'Resolved' } });
    
    res.status(200).json({ total_tickets, open_tickets, resolved_tickets });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.handleCategories = async (req, res) => {
  try {
    if (req.method === 'POST') {
      const { category_name, description } = req.body;
      const newCategory = await Category.create({ category_name, description });
      return res.status(201).json(newCategory);
    }
    const categories = await Category.findAll();
    res.status(200).json(categories);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
