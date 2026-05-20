const { Ticket, User, Category, SubCategory } = require('../models');
const { Op } = require('sequelize');

exports.getUsers = async (req, res) => {
  try {
    const users = await User.findAll({ attributes: { exclude: ['password_hash'] }, order: [['created_at', 'DESC']] });
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Prevent changing your own role or setting admin randomly if needed
    user.role = role;
    await user.save();
    
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateUserDepartment = async (req, res) => {
  try {
    const { department } = req.body;
    const validDepts = ['Networking', 'Windows', 'Others'];
    if (!validDepts.includes(department)) {
      return res.status(400).json({ message: 'Invalid department. Must be Networking, Windows, or Others.' });
    }
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.department = department;
    await user.save();
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Returns staff grouped by department, with availability based on active tickets
exports.getAvailableStaff = async (req, res) => {
  try {
    // Find all staff (support + admin)
    const allStaff = await User.findAll({
      where: { role: { [Op.in]: ['support', 'admin'] } },
      attributes: { exclude: ['password_hash'] },
    });

    // Find staff IDs who currently have at least one non-closed active ticket
    const busyTickets = await Ticket.findAll({
      where: {
        assigned_staff_id: { [Op.ne]: null },
        status: { [Op.notIn]: ['Closed'] },
      },
      attributes: ['assigned_staff_id'],
    });
    const busyStaffIds = new Set(busyTickets.map(t => t.assigned_staff_id));

    const DEPT_GROUPS = ['Networking', 'Windows', 'Others'];
    const grouped = {};
    DEPT_GROUPS.forEach(d => (grouped[d] = []));

    allStaff.forEach(u => {
      const dept = u.department || 'Others';
      const group = DEPT_GROUPS.includes(dept) ? dept : 'Others';
      grouped[group].push({
        id: u.id,
        full_name: u.full_name,
        department: dept,
        available: !busyStaffIds.has(u.id),
      });
    });

    res.status(200).json(grouped);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.assignTicket = async (req, res) => {
  try {
    const { ticket_id, staff_id, assigned_group } = req.body;
    const ticket = await Ticket.findByPk(ticket_id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    if (assigned_group !== undefined) {
      ticket.assigned_group = assigned_group || null;
      // If we change the group, we check if the currently assigned staff belongs to this new group.
      // If not, we clear the assigned staff.
      if (ticket.assigned_staff_id && assigned_group) {
        const staff = await User.findByPk(ticket.assigned_staff_id);
        if (staff && staff.department !== assigned_group) {
          ticket.assigned_staff_id = null;
        }
      }
    }
    
    if (staff_id !== undefined) {
      ticket.assigned_staff_id = staff_id || null;
      if (staff_id) {
        // If we assign a specific staff member, automatically set the group to their department.
        const staff = await User.findByPk(staff_id);
        if (staff) {
          ticket.assigned_group = staff.department || 'Others';
        }
      }
    }

    // Update ticket status to Assigned if either group or staff is assigned, otherwise if both are cleared set back to Open
    if (ticket.assigned_group || ticket.assigned_staff_id) {
      if (ticket.status === 'Open') {
        ticket.status = 'Assigned';
      }
    } else {
      if (ticket.status === 'Assigned') {
        ticket.status = 'Open';
      }
    }

    await ticket.save();

    // 🔴 Real-time: broadcast assignment to all clients
    const io = req.app.locals.io;
    if (io) io.emit('tickets:update', { event: 'updated', ticketId: ticket.id, status: ticket.status });

    res.status(200).json({ message: 'Ticket assigned successfully', ticket });
  } catch (err) {
    console.error(err);
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

exports.getActivity = async (req, res) => {
  try {
    const range = parseInt(req.query.range) || 7;
    const date = new Date();
    date.setDate(date.getDate() - range);
    
    // Fetch all tickets created in the range
    const { Op } = require('sequelize');
    const tickets = await Ticket.findAll({
      where: {
        created_at: { [Op.gte]: date }
      }
    });

    const resolved = await Ticket.findAll({
      where: {
        status: ['Resolved', 'Closed'],
        updated_at: { [Op.gte]: date } // Proxy for resolution date
      }
    });

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // Create an array for the last X days
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

exports.handleCategories = async (req, res) => {
  try {
    if (req.method === 'POST') {
      const { category_name, description } = req.body;
      const newCategory = await Category.create({ category_name, description });
      return res.status(201).json(newCategory);
    }
    const categories = await Category.findAll({
      include: [{ model: SubCategory, as: 'sub_categories' }]
    });
    res.status(200).json(categories);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.handleSubCategories = async (req, res) => {
  try {
    if (req.method === 'POST') {
      const { category_id, name } = req.body;
      const sub = await SubCategory.create({ category_id, name });
      return res.status(201).json(sub);
    }
    const { category_id } = req.query;
    const where = category_id ? { category_id } : {};
    const subs = await SubCategory.findAll({ where });
    res.status(200).json(subs);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.exportTickets = async (req, res) => {
  try {
    const { Parser } = require('json2csv');
    const tickets = await Ticket.findAll({
      include: [
        { model: User, as: 'author', attributes: ['full_name', 'email'] },
        { model: User, as: 'assigned_staff', attributes: ['full_name'] },
        { model: Category, as: 'category', attributes: ['category_name'] }
      ]
    });

    const fields = [
      'ticket_number', 'subject', 'priority', 'status',
      { label: 'Category', value: 'category.category_name' },
      { label: 'Author', value: 'author.full_name' },
      { label: 'Author Email', value: 'author.email' },
      { label: 'Assigned To', value: 'assigned_staff.full_name' },
      'created_at', 'updated_at'
    ];
    const opts = { fields };
    const parser = new Parser(opts);
    const csv = parser.parse(tickets);

    res.header('Content-Type', 'text/csv');
    res.attachment('tickets_export.csv');
    return res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
