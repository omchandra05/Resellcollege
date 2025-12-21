const express = require('express');
const http = require('http');

const connectDB = require('./config/db');
const config = require('./config');
const logger = require('./config/logger');

const app = express();

// middleware
app.use(express.json());

// db connect
connectDB();

// routes
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes'); 

app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes); 

// test route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// create one HTTP server
const httpServer = http.createServer(app);

// init socket.io on same server
const initSocket = require('./socket');
initSocket(httpServer, { corsOrigin: '*' });

// listen only once
const server = httpServer.listen(config.PORT, () => {
  logger.info(`Server is running on port ${config.PORT}`);
});

// graceful shutdown
process.on('SIGINT', () => {
  server.close(() => process.exit(0));
});
