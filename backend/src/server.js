require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../swagger.json');
const logger = require('./utils/logger');
const db = require('./database/db');

// Import routes
const webhookRoutes = require('./routes/webhook');
const queryRoutes = require('./routes/query');
const healthRoutes = require('./routes/health');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info('Incoming request', {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  next();
});

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Watson Orchestration API Docs'
}));

// API Routes
app.use('/api/webhook', webhookRoutes);
app.use('/api/query', queryRoutes);
app.use('/api/health', healthRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Watson Orchestration Backend API',
    version: '1.0.0',
    status: 'running',
    documentation: '/api-docs',
    endpoints: {
      webhook: '/api/webhook/watson',
      health: '/api/health',
      query: '/api/query/*',
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
  });
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Graceful shutdown handler
const gracefulShutdown = async (signal) => {
  logger.info(`${signal} received, starting graceful shutdown`);
  
  // Close server
  server.close(async () => {
    logger.info('HTTP server closed');
    
    // Close database connections
    try {
      await db.closePool();
      logger.info('Database connections closed');
      process.exit(0);
    } catch (error) {
      logger.error('Error during shutdown', { error: error.message });
      process.exit(1);
    }
  });
  
  // Force shutdown after 30 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
};

// Start server
const server = app.listen(PORT, async () => {
  logger.info(`Server started on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Test database connection
  const dbConnected = await db.testConnection();
  if (dbConnected) {
    logger.info('Database connection established');
  } else {
    logger.error('Database connection failed');
  }
  
  // Log pool stats
  const poolStats = db.getPoolStats();
  logger.info('Database pool initialized', poolStats);
});

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', {
    error: error.message,
    stack: error.stack,
  });
  gracefulShutdown('uncaughtException');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled promise rejection', {
    reason,
    promise,
  });
});

module.exports = app;

// Made with Bob
