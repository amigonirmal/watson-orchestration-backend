const express = require('express');
const router = express.Router();
const queries = require('../database/queries');
const logger = require('../utils/logger');
const { validateQueryParams } = require('../middleware/validation');

/**
 * GET /api/query/orders/stats
 * Get order statistics
 */
router.get('/orders/stats', validateQueryParams, async (req, res) => {
  try {
    const params = {
      dateStart: req.query.date_start || 'yesterday',
      dateEnd: req.query.date_end || 'today',
      statisticType: req.query.statistic_type || 'maximum',
      aggregation: req.query.aggregation || 'daily',
    };
    
    const result = await queries.getOrderStatistics(params);
    res.json(result);
  } catch (error) {
    logger.error('Error in orders/stats endpoint', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch order statistics' });
  }
});

/**
 * GET /api/query/component/performance
 * Get component performance metrics
 */
router.get('/component/performance', validateQueryParams, async (req, res) => {
  try {
    const params = {
      component: req.query.component,
      dateStart: req.query.date_start || 'last_7_days',
      dateEnd: req.query.date_end || 'today',
      metric: req.query.metric || 'all',
      serviceName: req.query.service_name,
      serviceType: req.query.service_type,
      statisticName: req.query.statistic_name,
    };
    
    const result = await queries.getComponentPerformance(params);
    res.json(result);
  } catch (error) {
    logger.error('Error in component/performance endpoint', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch component performance' });
  }
});

/**
 * GET /api/query/components/list
 * Get list of available components
 */
router.get('/components/list', async (req, res) => {
  try {
    const params = {
      searchTerm: req.query.search,
      limit: parseInt(req.query.limit || '300'),
    };
    
    const result = await queries.getComponentList(params);
    res.json(result);
  } catch (error) {
    logger.error('Error in components/list endpoint', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch component list' });
  }
});

/**
 * GET /api/query/timeseries
 * Get time series data for visualization
 */
router.get('/timeseries', validateQueryParams, async (req, res) => {
  try {
    const params = {
      component: req.query.component,
      dateStart: req.query.date_start || 'last_7_days',
      dateEnd: req.query.date_end || 'today',
      metric: req.query.metric || 'response_time',
      aggregation: req.query.aggregation || 'hourly',
      serviceName: req.query.service_name,
      serviceType: req.query.service_type,
      statisticName: req.query.statistic_name,
    };
    
    const result = await queries.getTimeSeriesData(params);
    res.json(result);
  } catch (error) {
    logger.error('Error in timeseries endpoint', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch time series data' });
  }
});

/**
 * GET /api/query/stats
 * Get general statistics for date range
 */
router.get('/stats', validateQueryParams, async (req, res) => {
  try {
    const params = {
      dateStart: req.query.date_start || 'last_7_days',
      dateEnd: req.query.date_end || 'today',
      serviceName: req.query.service_name,
      serviceType: req.query.service_type,
      statisticName: req.query.statistic_name,
    };
    
    const result = await queries.getDateRangeStatistics(params);
    res.json(result);
  } catch (error) {
    logger.error('Error in stats endpoint', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

/**
 * POST /api/query/components/compare
 * Compare multiple components
 */
router.post('/components/compare', validateQueryParams, async (req, res) => {
  try {
    const { components } = req.body;
    
    if (!components || !Array.isArray(components) || components.length === 0) {
      return res.status(400).json({ error: 'Components array is required' });
    }
    
    const params = {
      dateStart: req.body.date_start || 'last_7_days',
      dateEnd: req.body.date_end || 'today',
      statisticName: req.body.statistic_name,
      serviceType: req.body.service_type,
      serviceName: req.body.service_name,
      comparisonLevel: req.body.comparison_level || 'server',
      aggregation: req.body.aggregation,
    };
    
    const result = await queries.getComponentComparison(components, params);
    res.json(result);
  } catch (error) {
    logger.error('Error in components/compare endpoint', { error: error.message });
    res.status(500).json({ error: 'Failed to compare components' });
  }
});

module.exports = router;

// Made with Bob
