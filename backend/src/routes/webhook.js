const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const queries = require('../database/queries');
const { generateChart } = require('../services/visualizationService');

/**
 * Watson Assistant Webhook Handler
 * POST /api/webhook/watson
 */
router.post('/watson', async (req, res) => {
  try {
    const { intent, entities, context } = req.body;
    
    logger.info('Watson webhook received', { intent, entities });
    
    let response;
    
    switch (intent) {
      case 'query_order_statistics':
        response = await handleOrderStatistics(entities);
        break;
        
      case 'query_component_performance':
        response = await handleComponentPerformance(entities);
        break;
        
      case 'query_component_list':
        response = await handleComponentList(entities);
        break;
        
      case 'generate_visualization':
        response = await handleVisualization(entities);
        break;
        
      case 'query_date_range_stats':
        response = await handleDateRangeStats(entities);
        break;
        
      default:
        response = {
          text: "I'm not sure how to handle that request. Please try asking about order statistics, component performance, or visualizations.",
        };
    }
    
    res.json({
      response,
      context: {
        ...context,
        last_query: intent,
        timestamp: new Date().toISOString(),
      },
    });
    
  } catch (error) {
    logger.error('Webhook error', { error: error.message, stack: error.stack });
    res.status(500).json({
      response: {
        text: 'Sorry, I encountered an error processing your request. Please try again.',
      },
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * Handle order statistics queries
 */
async function handleOrderStatistics(entities) {
  const params = {
    dateStart: entities.date_start || 'yesterday',
    dateEnd: entities.date_end || entities.date_start || 'yesterday',
    statisticType: entities.statistic_type || 'maximum',
    aggregation: entities.aggregation || 'daily',
  };
  
  const result = await queries.getOrderStatistics(params);
  
  if (!result.data) {
    return {
      text: `No data found for the specified date range.`,
    };
  }
  
  const { order_count, time_period } = result.data;
  const dateStr = new Date(time_period).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: params.aggregation === 'hourly' ? '2-digit' : undefined,
  });
  
  return {
    text: `The ${params.statisticType} number of orders created was **${order_count.toLocaleString()}** on ${dateStr}.`,
    data: result.data,
  };
}

/**
 * Handle component performance queries
 */
async function handleComponentPerformance(entities) {
  const params = {
    component: entities.component,
    dateStart: entities.date_start || 'last_7_days',
    dateEnd: entities.date_end || 'today',
    metric: entities.metric || 'all',
  };
  
  const result = await queries.getComponentPerformance(params);
  
  if (!result.data || result.data.length === 0) {
    return {
      text: `No performance data found for ${params.component || 'the specified component'}.`,
    };
  }
  
  const component = result.data[0];
  let text = `**${component.component}** Performance:\n\n`;
  text += `📊 Total Requests: ${component.total_requests.toLocaleString()}\n`;
  
  if (component.avg_response_time) {
    text += `⚡ Avg Response Time: ${Math.round(component.avg_response_time)}ms\n`;
  }
  if (component.max_response_time) {
    text += `🔺 Max Response Time: ${component.max_response_time}ms\n`;
  }
  if (component.min_response_time) {
    text += `🔻 Min Response Time: ${component.min_response_time}ms\n`;
  }
  if (component.success_rate !== undefined) {
    text += `✅ Success Rate: ${component.success_rate}%\n`;
  }
  
  text += `\n✓ Successful: ${component.successful_requests.toLocaleString()}`;
  text += ` | ✗ Failed: ${component.failed_requests.toLocaleString()}`;
  
  return {
    text,
    data: component,
  };
}

/**
 * Handle component list queries
 */
async function handleComponentList(entities) {
  const params = {
    searchTerm: entities.search_term,
    limit: 20,
  };
  
  const result = await queries.getComponentList(params);
  
  if (!result.data || result.data.length === 0) {
    return {
      text: 'No components found matching your criteria.',
    };
  }
  
  let text = `Found **${result.metadata.count}** components:\n\n`;
  
  result.data.slice(0, 10).forEach((comp, index) => {
    text += `${index + 1}. **${comp.component_name}** - ${comp.request_count.toLocaleString()} requests\n`;
  });
  
  if (result.data.length > 10) {
    text += `\n...and ${result.data.length - 10} more components.`;
  }
  
  return {
    text,
    data: result.data,
  };
}

/**
 * Handle visualization requests
 */
async function handleVisualization(entities) {
  const params = {
    component: entities.component,
    dateStart: entities.date_start || 'last_7_days',
    dateEnd: entities.date_end || 'today',
    metric: entities.metric || 'response_time',
    aggregation: entities.aggregation || 'hourly',
    chartType: entities.chart_type || 'line',
  };
  
  // Get time series data
  const result = await queries.getTimeSeriesData(params);
  
  if (!result.data || result.data.length === 0) {
    return {
      text: 'No data available for visualization.',
    };
  }
  
  // Generate chart
  const chartUrl = await generateChart(result.data, params);
  
  return {
    text: `Here's the ${params.chartType} chart for ${params.component || 'all components'}:`,
    image_url: chartUrl,
    data: result.data,
  };
}

/**
 * Handle date range statistics queries
 */
async function handleDateRangeStats(entities) {
  const params = {
    dateStart: entities.date_start || 'last_7_days',
    dateEnd: entities.date_end || 'today',
  };
  
  const result = await queries.getDateRangeStatistics(params);
  
  if (!result.data) {
    return {
      text: 'No statistics available for the specified date range.',
    };
  }
  
  const stats = result.data;
  
  let text = `📊 **Statistics Summary**\n\n`;
  text += `📈 Total Requests: ${stats.total_requests.toLocaleString()}\n`;
  text += `⚡ Avg Response Time: ${Math.round(stats.avg_response_time)}ms\n`;
  text += `🔺 Max Response Time: ${stats.max_response_time}ms\n`;
  text += `🔻 Min Response Time: ${stats.min_response_time}ms\n`;
  text += `📊 P95 Response Time: ${Math.round(stats.p95_response_time)}ms\n`;
  text += `📊 P99 Response Time: ${Math.round(stats.p99_response_time)}ms\n`;
  text += `✅ Success Rate: ${stats.success_rate}%\n`;
  text += `🔧 Unique Components: ${stats.unique_components}\n`;
  text += `\n✓ Successful: ${stats.successful_requests.toLocaleString()}`;
  text += ` | ✗ Failed: ${stats.failed_requests.toLocaleString()}`;
  
  return {
    text,
    data: stats,
  };
}

module.exports = router;

// Made with Bob
