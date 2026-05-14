require('dotenv').config({ path: '../.env' });
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { Server } = require('socket.io');
const { sequelize } = require('./models');

const authRoutes   = require('./routes/auth');
const ticketRoutes = require('./routes/tickets');
const adminRoutes  = require('./routes/admin');
const notificationRoutes = require('./routes/notifications');

const app    = express();
const server = http.createServer(app);

// ── Socket.IO setup ──────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// Share io instance with controllers via app locals
app.locals.io = io;

io.on('connection', (socket) => {
  console.log(`[WS] client connected: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`[WS] client disconnected: ${socket.id}`);
  });
});

// ── Middleware ───────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(require('path').join(__dirname, '../uploads')));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per `window` (here, per 15 minutes)
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', apiLimiter);

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',    authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/admin',   adminRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'healthy', backend: 'express', realtime: 'socket.io' });
});

// ── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const { User, Category, Ticket, TicketLog, Feedback, Notification, TicketComment } = require('./models');

async function startServer() {
  try {
    await User.sync({ alter: true });
    await Category.sync({ alter: true });
    await Ticket.sync({ alter: true });
    await TicketLog.sync({ force: false });
    await Feedback.sync({ alter: true });
    await Notification.sync({ alter: true });
    await TicketComment.sync({ alter: true });
    console.log('Database synced');
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT} (Socket.IO enabled)`);
    });
  } catch (err) {
    console.error('Failed to sync database:', err.message);
  }
}

startServer();
