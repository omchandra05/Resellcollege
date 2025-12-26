const express = require('express');
const http = require('http');
const cors = require('cors');

const connectDB = require('./config/db');
const config = require('./config');
const logger = require('./config/logger');

const app = express();

// CORS middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
];
if (process.env.NODE_ENV === 'production' && process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

const corsOptions = {
  origin: (origin, callback) => {
    // `origin` is the domain making the request.
    // Allow the request if it's in the allowed list or if there's no origin (like for server-to-server requests).
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // Log the blocked origin for easy debugging and block the request.
      logger.error(`CORS Blocked: The origin '${origin}' is not in the allowed list.`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// db connect
connectDB();

// routes
const authRoutes = require('./routes/authRoutes');
const usersRoutes = require('./routes/usersRoutes');
const sellerRoutes = require('./routes/sellerRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const productRoutes = require('./routes/productRoutes');
const chatRoutes = require('./routes/chatRoutes');
const aiRoutes = require('./routes/aiRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/users/wishlist', wishlistRoutes); // Mount more specific routes first
app.use('/api/users', usersRoutes);
app.use('/api/seller', sellerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/ai', aiRoutes);

// test route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// create one HTTP server
const httpServer = http.createServer(app);

// Init socket.io on the same server with secure CORS options
const initSocket = require('./socket');
const io = initSocket(httpServer, { cors: corsOptions });
app.set('io', io); // Make io accessible in controllers

// Listen on the port provided by the environment (for Render) or fallback to config
const PORT = process.env.PORT || 3000;
const server = httpServer.listen(PORT, '0.0.0.0', () => {
  logger.info(`Server is running on port ${PORT}`);
});

// graceful shutdown
process.on('SIGINT', () => {
  server.close(() => process.exit(0));
});
