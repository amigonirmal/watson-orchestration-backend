const axios = require('axios');
const logger = require('../utils/logger');

// Chart.js configuration
const width = 800;
const height = 400;

// Try to load chartjs-node-canvas if available (optional dependency)
let ChartJSNodeCanvas;
let chartJSNodeCanvas;
try {
  ChartJSNodeCanvas = require('chartjs-node-canvas').ChartJSNodeCanvas;
  chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });
  logger.info('Chart.js canvas support enabled');
} catch (error) {
  logger.warn('Chart.js canvas not available - using QuickChart API only');
}

/**
 * Generate chart using QuickChart API
 * @param {Array} data - Time series data
 * @param {Object} params - Chart parameters
 * @returns {Promise<string>} Chart URL
 */
async function generateChart(data, params) {
  try {
    const { chartType, metric, component } = params;
    
    // Prepare chart data
    const chartConfig = buildChartConfig(data, params);
    
    // Use QuickChart API for quick generation
    const quickChartUrl = process.env.QUICKCHART_API_URL || 'https://quickchart.io/chart';
    
    const response = await axios.post(quickChartUrl, {
      chart: chartConfig,
      width,
      height,
      format: 'png',
      backgroundColor: 'white',
    });
    
    // QuickChart returns the image URL
    const imageUrl = `${quickChartUrl}?c=${encodeURIComponent(JSON.stringify(chartConfig))}`;
    
    logger.info('Chart generated successfully', {
      chartType,
      metric,
      component,
      dataPoints: data.length,
    });
    
    return imageUrl;
  } catch (error) {
    logger.error('Error generating chart', { error: error.message });
    throw error;
  }
}

/**
 * Build Chart.js configuration
 * @param {Array} data - Time series data
 * @param {Object} params - Chart parameters
 * @returns {Object} Chart.js config
 */
function buildChartConfig(data, params) {
  const { chartType, metric, component, aggregation } = params;
  
  // Extract labels and values
  const labels = data.map(d => formatLabel(d.time_period, aggregation));
  const values = data.map(d => extractMetricValue(d, metric));
  
  // Determine chart type
  const type = mapChartType(chartType);
  
  // Build dataset
  const dataset = {
    label: formatMetricLabel(metric, component),
    data: values,
    borderColor: 'rgb(75, 192, 192)',
    backgroundColor: type === 'line' ? 'rgba(75, 192, 192, 0.2)' : 'rgba(75, 192, 192, 0.5)',
    tension: 0.1,
    fill: type === 'area',
  };
  
  // Build chart config
  const config = {
    type,
    data: {
      labels,
      datasets: [dataset],
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: `${formatMetricLabel(metric, component)} - ${aggregation || 'Hourly'}`,
          font: {
            size: 16,
          },
        },
        legend: {
          display: true,
          position: 'top',
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: getYAxisLabel(metric),
          },
        },
        x: {
          title: {
            display: true,
            text: 'Time Period',
          },
        },
      },
    },
  };
  
  return config;
}

/**
 * Generate chart locally using chartjs-node-canvas
 * @param {Array} data - Time series data
 * @param {Object} params - Chart parameters
 * @returns {Promise<Buffer>} Chart image buffer
 */
async function generateChartLocal(data, params) {
  try {
    if (!chartJSNodeCanvas) {
      logger.warn('Local chart generation not available, falling back to QuickChart API');
      return generateChart(data, params);
    }
    
    const chartConfig = buildChartConfig(data, params);
    const imageBuffer = await chartJSNodeCanvas.renderToBuffer(chartConfig);
    
    logger.info('Chart generated locally', {
      chartType: params.chartType,
      dataPoints: data.length,
    });
    
    return imageBuffer;
  } catch (error) {
    logger.error('Error generating chart locally', { error: error.message });
    throw error;
  }
}

/**
 * Generate heatmap visualization
 * @param {Array} data - Time series data
 * @param {Object} params - Chart parameters
 * @returns {Promise<string>} Chart URL
 */
async function generateHeatmap(data, params) {
  try {
    // Group data by hour and day
    const heatmapData = processHeatmapData(data);
    
    const config = {
      type: 'matrix',
      data: {
        datasets: [{
          label: 'Request Volume',
          data: heatmapData,
          backgroundColor: (context) => {
            const value = context.dataset.data[context.dataIndex].v;
            const alpha = value / Math.max(...heatmapData.map(d => d.v));
            return `rgba(75, 192, 192, ${alpha})`;
          },
          borderWidth: 1,
          borderColor: 'rgba(0, 0, 0, 0.1)',
          width: ({ chart }) => (chart.chartArea || {}).width / 24 - 1,
          height: ({ chart }) => (chart.chartArea || {}).height / 7 - 1,
        }],
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Request Volume Heatmap',
          },
          legend: {
            display: false,
          },
        },
        scales: {
          x: {
            type: 'category',
            labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
            title: {
              display: true,
              text: 'Hour of Day',
            },
          },
          y: {
            type: 'category',
            labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            title: {
              display: true,
              text: 'Day of Week',
            },
          },
        },
      },
    };
    
    const quickChartUrl = process.env.QUICKCHART_API_URL || 'https://quickchart.io/chart';
    const imageUrl = `${quickChartUrl}?c=${encodeURIComponent(JSON.stringify(config))}`;
    
    return imageUrl;
  } catch (error) {
    logger.error('Error generating heatmap', { error: error.message });
    throw error;
  }
}

/**
 * Helper functions
 */

function mapChartType(type) {
  const mapping = {
    line: 'line',
    bar: 'bar',
    area: 'line',
    pie: 'pie',
    scatter: 'scatter',
  };
  return mapping[type] || 'line';
}

function formatLabel(timestamp, aggregation) {
  const date = new Date(timestamp);
  
  switch (aggregation) {
    case 'hourly':
      return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit' });
    case 'daily':
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    case 'weekly':
      return `Week of ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    case 'monthly':
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    default:
      return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit' });
  }
}

function extractMetricValue(dataPoint, metric) {
  switch (metric) {
    case 'response_time':
    case 'avg_response_time':
      return Math.round(dataPoint.avg_response_time || 0);
    case 'max_response_time':
      return dataPoint.max_response_time || 0;
    case 'min_response_time':
      return dataPoint.min_response_time || 0;
    case 'success_rate':
      return parseFloat(dataPoint.success_rate || 0);
    case 'request_count':
      return dataPoint.request_count || 0;
    default:
      return Math.round(dataPoint.avg_response_time || 0);
  }
}

function formatMetricLabel(metric, component) {
  const componentStr = component ? ` - ${component}` : '';
  
  switch (metric) {
    case 'response_time':
    case 'avg_response_time':
      return `Average Response Time${componentStr}`;
    case 'max_response_time':
      return `Maximum Response Time${componentStr}`;
    case 'min_response_time':
      return `Minimum Response Time${componentStr}`;
    case 'success_rate':
      return `Success Rate${componentStr}`;
    case 'request_count':
      return `Request Count${componentStr}`;
    default:
      return `Performance Metric${componentStr}`;
  }
}

function getYAxisLabel(metric) {
  switch (metric) {
    case 'response_time':
    case 'avg_response_time':
    case 'max_response_time':
    case 'min_response_time':
      return 'Response Time (ms)';
    case 'success_rate':
      return 'Success Rate (%)';
    case 'request_count':
      return 'Number of Requests';
    default:
      return 'Value';
  }
}

function processHeatmapData(data) {
  const heatmapData = [];
  
  data.forEach(d => {
    const date = new Date(d.time_period);
    const hour = date.getHours();
    const day = date.getDay();
    
    heatmapData.push({
      x: hour,
      y: day,
      v: d.request_count || 0,
    });
  });
  
  return heatmapData;
}

module.exports = {
  generateChart,
  generateChartLocal,
  generateHeatmap,
};

// Made with Bob
