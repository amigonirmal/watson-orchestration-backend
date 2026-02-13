const db = require('./db');
const logger = require('../utils/logger');
const { parseDate, getDateRange } = require('../utils/dateHelper');

/**
 * Query order statistics for a date range
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Query results
 */
async function getOrderStatistics(params) {
  const { dateStart, dateEnd, statisticType, aggregation } = params;
  
  try {
    const { start, end } = getDateRange(dateStart, dateEnd);
    
    let groupByClause = '';
    let selectClause = '';
    
    // Determine aggregation level
    switch (aggregation) {
      case 'hourly':
        groupByClause = "DATE_TRUNC('hour', start_time_stamp)";
        selectClause = "DATE_TRUNC('hour', start_time_stamp) as time_period";
        break;
      case 'daily':
        groupByClause = "DATE_TRUNC('day', start_time_stamp)";
        selectClause = "DATE_TRUNC('day', start_time_stamp) as time_period";
        break;
      case 'weekly':
        groupByClause = "DATE_TRUNC('week', start_time_stamp)";
        selectClause = "DATE_TRUNC('week', start_time_stamp) as time_period";
        break;
      case 'monthly':
        groupByClause = "DATE_TRUNC('month', start_time_stamp)";
        selectClause = "DATE_TRUNC('month', start_time_stamp) as time_period";
        break;
      default:
        groupByClause = "DATE_TRUNC('day', start_time_stamp)";
        selectClause = "DATE_TRUNC('day', start_time_stamp) as time_period";
    }
    
    const query = `
      SELECT 
        ${selectClause},
        SUM(statistic_value) as total_value,
        COUNT(*) as record_count
      FROM yfs_statistics_detail
      WHERE start_time_stamp >= $1 
        AND end_time_stamp <= $2
      GROUP BY ${groupByClause}
      ORDER BY ${statisticType === 'minimum' ? 'total_value ASC' : 'total_value DESC'}
      LIMIT 1
    `;
    
    const result = await db.query(query, [start, end]);
    
    return {
      success: true,
      data: result.rows[0] || null,
      metadata: {
        dateStart: start,
        dateEnd: end,
        aggregation,
        statisticType,
      },
    };
  } catch (error) {
    logger.error('Error querying order statistics', { error: error.message });
    throw error;
  }
}

/**
 * Query component performance metrics
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Query results
 */
async function getComponentPerformance(params) {
  const { component, dateStart, dateEnd, metric, serviceName, serviceType, statisticName } = params;
  
  try {
    const { start, end } = getDateRange(dateStart, dateEnd);
    
    // Build dynamic WHERE clauses
    const conditions = ['start_time_stamp >= $1', 'end_time_stamp <= $2'];
    const queryParams = [start, end];
    let paramIndex = 3;
    
    if (component) {
      conditions.push(`server_name ILIKE $${paramIndex}`);
      queryParams.push(`%${component}%`);
      paramIndex++;
    }
    
    if (serviceName) {
      conditions.push(`service_name ILIKE $${paramIndex}`);
      queryParams.push(`%${serviceName}%`);
      paramIndex++;
    }
    
    if (serviceType) {
      conditions.push(`service_type = $${paramIndex}`);
      queryParams.push(serviceType);
      paramIndex++;
    } else {
      conditions.push("service_type IN ('INTEGRATION', 'AGENT')");
    }
    
    if (statisticName) {
      conditions.push(`statistic_name ILIKE $${paramIndex}`);
      queryParams.push(`%${statisticName}%`);
      paramIndex++;
    }
    
    const query = `
      SELECT
        server_name,
        service_name,
        service_type,
        statistic_name,
        COUNT(*) as total_records,
        SUM(statistic_value) as total_value,
        AVG(statistic_value) as avg_value,
        MAX(statistic_value) as max_value,
        MIN(statistic_value) as min_value
      FROM yfs_statistics_detail
      WHERE ${conditions.join(' AND ')}
      GROUP BY server_name, service_name, service_type, statistic_name
      ORDER BY total_value DESC
      LIMIT 20
    `;
    
    const result = await db.query(query, queryParams);
    
    return {
      success: true,
      data: result.rows,
      metadata: {
        component,
        dateStart: start,
        dateEnd: end,
        metric,
        serviceName,
        serviceType,
        statisticName,
        count: result.rowCount,
      },
    };
  } catch (error) {
    logger.error('Error querying component performance', { error: error.message });
    throw error;
  }
}

/**
 * Get time series data for visualization
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Time series data
 */
async function getTimeSeriesData(params) {
  const { component, dateStart, dateEnd, metric, aggregation, serviceName, serviceType, statisticName } = params;
  
  try {
    const { start, end } = getDateRange(dateStart, dateEnd);
    
    let groupByClause = '';
    let selectClause = '';
    
    switch (aggregation || 'hourly') {
      case 'hourly':
        groupByClause = "DATE_TRUNC('hour', start_time_stamp)";
        selectClause = "DATE_TRUNC('hour', start_time_stamp) as time_period";
        break;
      case 'daily':
        groupByClause = "DATE_TRUNC('day', start_time_stamp)";
        selectClause = "DATE_TRUNC('day', start_time_stamp) as time_period";
        break;
      default:
        groupByClause = "DATE_TRUNC('hour', start_time_stamp)";
        selectClause = "DATE_TRUNC('hour', start_time_stamp) as time_period";
    }
    
    // Build dynamic WHERE clauses
    const conditions = ['start_time_stamp >= $1', 'end_time_stamp <= $2'];
    const queryParams = [start, end];
    let paramIndex = 3;
    
    if (component) {
      conditions.push(`server_name ILIKE $${paramIndex}`);
      queryParams.push(`%${component}%`);
      paramIndex++;
    }
    
    if (serviceName) {
      conditions.push(`service_name ILIKE $${paramIndex}`);
      queryParams.push(`%${serviceName}%`);
      paramIndex++;
    }
    
    if (serviceType) {
      conditions.push(`service_type = $${paramIndex}`);
      queryParams.push(serviceType);
      paramIndex++;
    } else {
      conditions.push("service_type IN ('INTEGRATION', 'AGENT')");
    }
    
    if (statisticName) {
      conditions.push(`statistic_name ILIKE $${paramIndex}`);
      queryParams.push(`%${statisticName}%`);
      paramIndex++;
    }
    
    const query = `
      SELECT
        ${selectClause},
        server_name,
        service_name,
        service_type,
        statistic_name,
        SUM(statistic_value) as total_value,
        AVG(statistic_value) as avg_value,
        MAX(statistic_value) as max_value,
        MIN(statistic_value) as min_value,
        COUNT(*) as record_count
      FROM yfs_statistics_detail
      WHERE ${conditions.join(' AND ')}
      GROUP BY ${groupByClause}, server_name, service_name, service_type, statistic_name
      ORDER BY time_period ASC
    `;
    
    const result = await db.query(query, queryParams);
    
    return {
      success: true,
      data: result.rows,
      metadata: {
        component,
        dateStart: start,
        dateEnd: end,
        metric,
        aggregation: aggregation || 'hourly',
        serviceName,
        serviceType,
        statisticName,
        count: result.rowCount,
      },
    };
  } catch (error) {
    logger.error('Error querying time series data', { error: error.message });
    throw error;
  }
}

/**
 * Get list of available components (servers) with their categories
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Component list with categories
 */
async function getComponentList(params) {
  const { searchTerm, limit } = params;
  
  try {
    // Optimized query: Get distinct servers with their service combinations and statistic names as array
    const query = `
      WITH distinct_servers AS (
        SELECT DISTINCT server_name
        FROM yfs_statistics_detail
        WHERE service_type IN ('AGENT', 'INTEGRATION')
          ${searchTerm ? 'AND server_name ILIKE $1' : ''}
        ORDER BY server_name
        LIMIT ${limit || 300}
      )
      SELECT
        ysd.server_name,
        ysd.service_name,
        ysd.service_type,
        ysd.context_name,
        ARRAY_AGG(DISTINCT ysd.statistic_name ORDER BY ysd.statistic_name) as statistic_names
      FROM yfs_statistics_detail ysd
      INNER JOIN distinct_servers ds ON ysd.server_name = ds.server_name
      GROUP BY ysd.server_name, ysd.service_name, ysd.service_type, ysd.context_name
      ORDER BY ysd.server_name, ysd.service_type, ysd.service_name
    `;
    
    const queryParams = searchTerm ? [`%${searchTerm}%`] : [];
    const result = await db.query(query, queryParams);
    
    // Group results by server
    const serversMap = new Map();
    
    result.rows.forEach(row => {
      if (!serversMap.has(row.server_name)) {
        serversMap.set(row.server_name, {
          server_name: row.server_name,
          services: []
        });
      }
      
      const server = serversMap.get(row.server_name);
      server.services.push({
        service_name: row.service_name,
        service_type: row.service_type,
        context_name: row.context_name,
        statistic_names: row.statistic_names
      });
    });
    
    const serversWithServices = Array.from(serversMap.values());
    
    return {
      success: true,
      data: serversWithServices,
      metadata: {
        searchTerm,
        count: serversWithServices.length,
        limit: limit || 300,
        total_services: result.rowCount
      },
    };
  } catch (error) {
    logger.error('Error querying component list', { error: error.message });
    throw error;
  }
}

/**
 * Get general statistics for a date range
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Statistics
 */
async function getDateRangeStatistics(params) {
  const { dateStart, dateEnd, serviceName, serviceType, statisticName } = params;
  
  try {
    const { start, end } = getDateRange(dateStart, dateEnd);
    
    // Build dynamic WHERE clauses
    const conditions = ['start_time_stamp >= $1', 'end_time_stamp <= $2'];
    const queryParams = [start, end];
    let paramIndex = 3;
    
    if (serviceName) {
      conditions.push(`service_name ILIKE $${paramIndex}`);
      queryParams.push(`%${serviceName}%`);
      paramIndex++;
    }
    
    if (serviceType) {
      conditions.push(`service_type = $${paramIndex}`);
      queryParams.push(serviceType);
      paramIndex++;
    }
    
    if (statisticName) {
      conditions.push(`statistic_name ILIKE $${paramIndex}`);
      queryParams.push(`%${statisticName}%`);
      paramIndex++;
    }
    
    const query = `
      SELECT
        COUNT(*) as total_records,
        COUNT(DISTINCT server_name) as unique_servers,
        COUNT(DISTINCT service_name) as unique_services,
        COUNT(DISTINCT statistic_name) as unique_statistics,
        SUM(statistic_value) as total_value,
        AVG(statistic_value) as avg_value,
        MAX(statistic_value) as max_value,
        MIN(statistic_value) as min_value,
        MIN(start_time_stamp) as earliest_record,
        MAX(end_time_stamp) as latest_record
      FROM yfs_statistics_detail
      WHERE ${conditions.join(' AND ')}
    `;
    
    const result = await db.query(query, queryParams);
    
    return {
      success: true,
      data: result.rows[0],
      metadata: {
        dateStart: start,
        dateEnd: end,
        serviceName,
        serviceType,
        statisticName,
      },
    };
  } catch (error) {
    logger.error('Error querying date range statistics', { error: error.message });
    throw error;
  }
}

/**
 * Get component comparison data
 * @param {Array} components - List of components (server names or service names) to compare
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Comparison data
 */
async function getComponentComparison(components, params) {
  const { dateStart, dateEnd, statisticName, serviceType, serviceName, comparisonLevel, aggregation } = params;
  
  try {
    const { start, end } = getDateRange(dateStart, dateEnd);
    
    // Build dynamic WHERE clauses
    const conditions = [
      'start_time_stamp >= $1',
      'end_time_stamp <= $2'
    ];
    const queryParams = [start, end];
    let paramIndex = 3;
    
    // Determine comparison level: 'server' or 'service'
    const isServiceLevel = comparisonLevel === 'service';
    
    if (isServiceLevel) {
      // Service-level comparison
      conditions.push(`service_name = ANY($${paramIndex})`);
      queryParams.push(components);
      paramIndex++;
    } else {
      // Server-level comparison (default)
      conditions.push(`server_name = ANY($${paramIndex})`);
      queryParams.push(components);
      paramIndex++;
      
      // For server-level, filter by AGENT or INTEGRATION
      if (serviceType) {
        conditions.push(`service_type = $${paramIndex}`);
        queryParams.push(serviceType);
        paramIndex++;
      } else {
        conditions.push("service_type IN ('INTEGRATION', 'AGENT')");
      }
    }
    
    // Filter by specific service name if provided
    if (serviceName && !isServiceLevel) {
      conditions.push(`service_name ILIKE $${paramIndex}`);
      queryParams.push(`%${serviceName}%`);
      paramIndex++;
    }
    
    // Filter by statistic name (Invocations, Average, Maximum, Minimum)
    if (statisticName) {
      conditions.push(`statistic_name = $${paramIndex}`);
      queryParams.push(statisticName);
      paramIndex++;
    }
    
    // Handle time aggregation if requested
    let timeGroupClause = '';
    let timeSelectClause = '';
    
    if (aggregation) {
      switch (aggregation) {
        case 'hourly':
          timeGroupClause = ", DATE_TRUNC('hour', start_time_stamp)";
          timeSelectClause = ", DATE_TRUNC('hour', start_time_stamp) as time_period";
          break;
        case 'daily':
          timeGroupClause = ", DATE_TRUNC('day', start_time_stamp)";
          timeSelectClause = ", DATE_TRUNC('day', start_time_stamp) as time_period";
          break;
      }
    }
    
    const groupByClause = isServiceLevel
      ? `service_name, service_type, statistic_name${timeGroupClause}`
      : `server_name, service_type, statistic_name${timeGroupClause}`;
    
    const selectClause = isServiceLevel
      ? `service_name as component_name, service_type${timeSelectClause}`
      : `server_name as component_name, service_type${timeSelectClause}`;
    
    const orderByClause = aggregation
      ? 'component_name, time_period, statistic_name'
      : 'component_name, statistic_name';
    
    const query = `
      SELECT
        ${selectClause},
        statistic_name,
        COUNT(*) as total_records,
        SUM(statistic_value) as total_value,
        AVG(statistic_value) as avg_value,
        MAX(statistic_value) as max_value,
        MIN(statistic_value) as min_value
      FROM yfs_statistics_detail
      WHERE ${conditions.join(' AND ')}
      GROUP BY ${groupByClause}
      ORDER BY ${orderByClause}
    `;
    
    const result = await db.query(query, queryParams);
    
    return {
      success: true,
      data: result.rows,
      metadata: {
        components,
        comparisonLevel: comparisonLevel || 'server',
        statisticName,
        serviceType,
        serviceName,
        aggregation,
        dateStart: start,
        dateEnd: end,
        count: result.rowCount,
      },
    };
  } catch (error) {
    logger.error('Error querying component comparison', { error: error.message });
    throw error;
  }
}

module.exports = {
  getOrderStatistics,
  getComponentPerformance,
  getTimeSeriesData,
  getComponentList,
  getDateRangeStatistics,
  getComponentComparison,
};

// Made with Bob
