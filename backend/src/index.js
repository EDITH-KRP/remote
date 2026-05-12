require('dotenv').config({ path: '../.env' });
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');

const authRoutes = require('./routes/auth');
const ticketRoutes = require('./routes/tickets');
const adminRoutes = require('./routes/admin');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'healthy', backend: 'express' });
});

const PORT = process.env.PORT || 5000;

const { User, Category, Ticket, TicketLog, Feedback, Notification } = require('./models');

async function startServer() {
  try {
    // Sync each model individually - ticket_logs uses force:false to avoid column conflicts
    await User.sync({ alter: true });
    await Category.sync({ alter: true });
    await Ticket.sync({ alter: true });
    await TicketLog.sync({ force: false }); // already exists in Supabase with 'timestamp' column
    await Feedback.sync({ alter: true });
    await Notification.sync({ alter: true });
    console.log('Database synced');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to sync database:', err.message);
  }
}

startServer();
