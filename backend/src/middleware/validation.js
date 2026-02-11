const Joi = require('joi');
const logger = require('../utils/logger');

/**
 * Validation schemas
 */
const schemas = {
  queryParams: Joi.object({
    date_start: Joi.string().optional(),
    date_end: Joi.string().optional(),
    component: Joi.string().optional(),
    metric: Joi.string().valid(
      'response_time',
      'avg_response_time',
      'max_response_time',
      'min_response_time',
      'success_rate',
      'error_rate',
      'request_count',
      'throughput',
      'all'
    ).optional(),
    aggregation: Joi.string().valid('hourly', 'daily', 'weekly', 'monthly', 'minute').optional(),
    statistic_type: Joi.string().valid('maximum', 'minimum', 'average', 'total', 'median').optional(),
    limit: Joi.number().integer().min(1).max(1000).optional(),
    search: Joi.string().max(200).optional(),
  }).unknown(true),
  
  webhookBody: Joi.object({
    intent: Joi.string().required(),
    entities: Joi.object().optional(),
    context: Joi.object().optional(),
  }),
  
  componentCompare: Joi.object({
    components: Joi.array().items(Joi.string()).min(1).max(10).required(),
    date_start: Joi.string().optional(),
    date_end: Joi.string().optional(),
  }),
};

/**
 * Validate query parameters middleware
 */
function validateQueryParams(req, res, next) {
  const { error } = schemas.queryParams.validate(req.query);
  
  if (error) {
    logger.warn('Query parameter validation failed', {
      error: error.details[0].message,
      query: req.query,
    });
    
    return res.status(400).json({
      error: 'Invalid query parameters',
      details: error.details[0].message,
    });
  }
  
  next();
}

/**
 * Validate webhook body middleware
 */
function validateWebhookBody(req, res, next) {
  const { error } = schemas.webhookBody.validate(req.body);
  
  if (error) {
    logger.warn('Webhook body validation failed', {
      error: error.details[0].message,
      body: req.body,
    });
    
    return res.status(400).json({
      error: 'Invalid webhook payload',
      details: error.details[0].message,
    });
  }
  
  next();
}

/**
 * Validate component comparison body middleware
 */
function validateComponentCompare(req, res, next) {
  const { error } = schemas.componentCompare.validate(req.body);
  
  if (error) {
    logger.warn('Component comparison validation failed', {
      error: error.details[0].message,
      body: req.body,
    });
    
    return res.status(400).json({
      error: 'Invalid comparison request',
      details: error.details[0].message,
    });
  }
  
  next();
}

/**
 * API key authentication middleware
 */
function authenticateApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'] || req.query.api_key;
  const expectedApiKey = process.env.API_KEY;
  
  // Skip authentication in development if no API key is set
  if (process.env.NODE_ENV === 'development' && !expectedApiKey) {
    return next();
  }
  
  if (!apiKey) {
    logger.warn('API key missing', { ip: req.ip, path: req.path });
    return res.status(401).json({
      error: 'API key required',
      message: 'Please provide an API key in the X-API-Key header or api_key query parameter',
    });
  }
  
  if (apiKey !== expectedApiKey) {
    logger.warn('Invalid API key', { ip: req.ip, path: req.path });
    return res.status(403).json({
      error: 'Invalid API key',
      message: 'The provided API key is not valid',
    });
  }
  
  next();
}

module.exports = {
  validateQueryParams,
  validateWebhookBody,
  validateComponentCompare,
  authenticateApiKey,
};

// Made with Bob
