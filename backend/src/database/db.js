const { Pool } = require('pg');
const logger = require('../utils/logger');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'postgres',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  min: parseInt(process.env.DB_POOL_MIN || '2'),
  max: parseInt(process.env.DB_POOL_MAX || '10'),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
};

// Create connection pool
const pool = new Pool(dbConfig);

// Pool error handler
pool.on('error', (err) => {
  logger.error('Unexpected database pool error', { error: err.message });
});

// Pool connection handler
pool.on('connect', () => {
  logger.debug('New database connection established');
});

// Pool removal handler
pool.on('remove', () => {
  logger.debug('Database connection removed from pool');
});

/**
 * Execute a query with parameters
 * @param {string} text - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<Object>} Query result
 */
async function query(text, params) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug('Executed query', {
      query: text,
      duration: `${duration}ms`,
      rows: result.rowCount,
    });
    return result;
  } catch (error) {
    logger.error('Database query error', {
      query: text,
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
}

/**
 * Get a client from the pool for transactions
 * @returns {Promise<Object>} Database client
 */
async function getClient() {
  const client = await pool.connect();
  const originalQuery = client.query;
  const originalRelease = client.release;

  // Set a timeout for the client
  const timeout = setTimeout(() => {
    logger.error('Client checkout timeout - releasing client');
    client.release();
  }, 30000);

  // Override query to log
  client.query = (...args) => {
    client.lastQuery = args;
    return originalQuery.apply(client, args);
  };

  // Override release to clear timeout
  client.release = () => {
    clearTimeout(timeout);
    client.query = originalQuery;
    client.release = originalRelease;
    return originalRelease.apply(client);
  };

  return client;
}

/**
 * Test database connection
 * @returns {Promise<boolean>} Connection status
 */
async function testConnection() {
  try {
    const result = await query('SELECT NOW() as current_time');
    logger.info('Database connection successful', {
      time: result.rows[0].current_time,
    });
    return true;
  } catch (error) {
    logger.error('Database connection failed', { error: error.message });
    return false;
  }
}

/**
 * Close all database connections
 * @returns {Promise<void>}
 */
async function closePool() {
  try {
    await pool.end();
    logger.info('Database pool closed');
  } catch (error) {
    logger.error('Error closing database pool', { error: error.message });
    throw error;
  }
}

/**
 * Get pool statistics
 * @returns {Object} Pool statistics
 */
function getPoolStats() {
  return {
    total: pool.totalCount,
    idle: pool.idleCount,
    waiting: pool.waitingCount,
  };
}

module.exports = {
  query,
  getClient,
  testConnection,
  closePool,
  getPoolStats,
  pool,
};

// Made with Bob
