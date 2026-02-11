const express = require('express');
const router = express.Router();
const db = require('../database/db');
const logger = require('../utils/logger');

/**
 * GET /api/health
 * Health check endpoint
 */
router.get('/', async (req, res) => {
  try {
    const dbHealthy = await db.testConnection();
    const poolStats = db.getPoolStats();
    
    const health = {
      status: dbHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      database: {
        connected: dbHealthy,
        pool: poolStats,
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        unit: 'MB',
      },
    };
    
    const statusCode = dbHealthy ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    logger.error('Health check failed', { error: error.message });
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/health/ready
 * Readiness probe for Kubernetes
 */
router.get('/ready', async (req, res) => {
  try {
    const dbHealthy = await db.testConnection();
    
    if (dbHealthy) {
      res.status(200).json({ ready: true });
    } else {
      res.status(503).json({ ready: false, reason: 'Database not connected' });
    }
  } catch (error) {
    res.status(503).json({ ready: false, reason: error.message });
  }
});

/**
 * GET /api/health/live
 * Liveness probe for Kubernetes
 */
router.get('/live', (req, res) => {
  res.status(200).json({ alive: true });
});

module.exports = router;

// Made with Bob
