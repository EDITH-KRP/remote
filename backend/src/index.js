require('dotenv').config({ path: '../.env' });
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { Server } = require('socket.io');
const { sequelize } = require('./models');
require('dns').setDefaultResultOrder('ipv4first');

const authRoutes   = require('./routes/auth');
const ticketRoutes = require('./routes/tickets');
const adminRoutes  = require('./routes/admin');
const notificationRoutes = require('./routes/notifications');

const app    = express();
const server = http.createServer(app);

// Trust the first proxy (required for Render/Heroku and express-rate-limit)
app.set('trust proxy', 1);

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
const allowedOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5000'];
if (process.env.FRONTEND_URL) {
  const cleanUrl = process.env.FRONTEND_URL.trim().replace(/\/$/, '');
  allowedOrigins.push(cleanUrl);
  allowedOrigins.push(cleanUrl + '/');
}

const isOriginAllowed = (origin) => {
  if (!origin) return true;
  const cleanOrigin = origin.trim().replace(/\/$/, '');
  
  if (allowedOrigins.includes(cleanOrigin) || allowedOrigins.includes(cleanOrigin + '/')) {
    return true;
  }
  
  // Robust check to automatically allow any remotedesk* Vercel subdomains.
  // This automatically resolves spelling discrepancies (supprot vs support) and preview URLs.
  if (cleanOrigin.startsWith('https://remotedesk') && cleanOrigin.endsWith('.vercel.app')) {
    return true;
  }
  
  if (process.env.FRONTEND_URL) {
    const envUrl = process.env.FRONTEND_URL.trim().replace(/\/$/, '');
    if (cleanOrigin === envUrl || cleanOrigin === envUrl + '/') {
      return true;
    }
  }
  return false;
};

app.use(cors({
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(require('path').join(__dirname, '../uploads')));

// Anti-CSRF Origin Guard
const csrfGuard = (req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }
  const origin = req.headers.origin;
  const referer = req.headers.referer;
  
  if (origin && !isOriginAllowed(origin)) {
    return res.status(403).json({ message: 'CSRF Blocked: Insecure request origin.' });
  }
  if (!origin && referer) {
    try {
      const refererOrigin = new URL(referer).origin;
      if (!isOriginAllowed(refererOrigin)) {
        return res.status(403).json({ message: 'CSRF Blocked: Insecure request referer.' });
      }
    } catch (e) {
      return res.status(403).json({ message: 'CSRF Blocked: Invalid referer header.' });
    }
  }
  next();
};
app.use('/api', csrfGuard);

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per `window` (here, per 15 minutes)
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', apiLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // Limit each IP to 15 auth attempts per 15 minutes
  message: { message: 'Too many authentication attempts. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);
app.use('/api/auth/reset-password', authLimiter);

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
