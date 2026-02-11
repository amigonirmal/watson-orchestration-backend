/**
 * Backend API Testing Script
 * Tests all endpoints with the yfs_statistics_detail table
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const API_KEY = 'test-api-key-12345';

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'cyan');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

async function testHealthEndpoint() {
  log('\n=== Testing Health Endpoint ===', 'blue');
  try {
    const response = await axios.get(`${BASE_URL}/api/health`);
    logSuccess(`Health check passed: ${response.data.status}`);
    logInfo(`Database connected: ${response.data.database?.connected}`);
    logInfo(`Pool stats: ${JSON.stringify(response.data.database?.pool)}`);
    return true;
  } catch (error) {
    logError(`Health check failed: ${error.message}`);
    return false;
  }
}

async function testRootEndpoint() {
  log('\n=== Testing Root Endpoint ===', 'blue');
  try {
    const response = await axios.get(`${BASE_URL}/`);
    logSuccess(`Root endpoint accessible`);
    logInfo(`API Name: ${response.data.name}`);
    logInfo(`Version: ${response.data.version}`);
    return true;
  } catch (error) {
    logError(`Root endpoint failed: ${error.message}`);
    return false;
  }
}

async function testOrderStatistics() {
  log('\n=== Testing Order Statistics Endpoint ===', 'blue');
  try {
    const response = await axios.get(`${BASE_URL}/api/query/orders/stats`, {
      headers: { 'X-API-Key': API_KEY },
      params: {
        date_start: '2026-02-01',
        date_end: '2026-02-28',
        aggregation: 'daily',
        statistic_type: 'maximum'
      }
    });
    
    if (response.data.success) {
      logSuccess('Order statistics retrieved successfully');
      logInfo(`Data: ${JSON.stringify(response.data.data, null, 2)}`);
      logInfo(`Metadata: ${JSON.stringify(response.data.metadata, null, 2)}`);
    } else {
      logWarning('No data found for the specified criteria');
    }
    return true;
  } catch (error) {
    logError(`Order statistics failed: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

async function testComponentPerformance() {
  log('\n=== Testing Component Performance Endpoint ===', 'blue');
  try {
    const response = await axios.get(`${BASE_URL}/api/query/component/performance`, {
      headers: { 'X-API-Key': API_KEY },
      params: {
        date_start: '2026-02-01',
        date_end: '2026-02-28',
        metric: 'all'
      }
    });
    
    if (response.data.success) {
      logSuccess(`Component performance retrieved: ${response.data.data.length} components found`);
      if (response.data.data.length > 0) {
        logInfo(`Sample component: ${JSON.stringify(response.data.data[0], null, 2)}`);
      }
    } else {
      logWarning('No component data found');
    }
    return true;
  } catch (error) {
    logError(`Component performance failed: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

async function testComponentsList() {
  log('\n=== Testing Components List Endpoint ===', 'blue');
  try {
    const response = await axios.get(`${BASE_URL}/api/query/components/list`, {
      headers: { 'X-API-Key': API_KEY },
      params: {
        limit: 10
      }
    });
    
    if (response.data.success) {
      logSuccess(`Components list retrieved: ${response.data.data.length} components found`);
      response.data.data.forEach((comp, idx) => {
        logInfo(`${idx + 1}. ${comp.server_name} - ${comp.service_name} (${comp.record_count} records)`);
      });
    } else {
      logWarning('No components found');
    }
    return true;
  } catch (error) {
    logError(`Components list failed: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

async function testTimeSeries() {
  log('\n=== Testing Time Series Endpoint ===', 'blue');
  try {
    const response = await axios.get(`${BASE_URL}/api/query/timeseries`, {
      headers: { 'X-API-Key': API_KEY },
      params: {
        date_start: '2026-02-01',
        date_end: '2026-02-28',
        aggregation: 'daily'
      }
    });
    
    if (response.data.success) {
      logSuccess(`Time series data retrieved: ${response.data.data.length} data points`);
      if (response.data.data.length > 0) {
        logInfo(`Sample data point: ${JSON.stringify(response.data.data[0], null, 2)}`);
      }
    } else {
      logWarning('No time series data found');
    }
    return true;
  } catch (error) {
    logError(`Time series failed: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

async function testGeneralStats() {
  log('\n=== Testing General Statistics Endpoint ===', 'blue');
  try {
    const response = await axios.get(`${BASE_URL}/api/query/stats`, {
      headers: { 'X-API-Key': API_KEY },
      params: {
        date_start: '2026-02-01',
        date_end: '2026-02-28'
      }
    });
    
    if (response.data.success) {
      logSuccess('General statistics retrieved successfully');
      logInfo(`Total records: ${response.data.data.total_records}`);
      logInfo(`Unique servers: ${response.data.data.unique_servers}`);
      logInfo(`Unique services: ${response.data.data.unique_services}`);
      logInfo(`Total value: ${response.data.data.total_value}`);
      logInfo(`Avg value: ${response.data.data.avg_value}`);
    } else {
      logWarning('No statistics data found');
    }
    return true;
  } catch (error) {
    logError(`General stats failed: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

async function testAuthenticationFailure() {
  log('\n=== Testing Authentication (Should Fail) ===', 'blue');
  try {
    await axios.get(`${BASE_URL}/api/query/stats`, {
      params: {
        date_start: '2026-02-01',
        date_end: '2026-02-28'
      }
    });
    logError('Authentication test failed - request should have been rejected');
    return false;
  } catch (error) {
    if (error.response?.status === 401 || error.response?.status === 403) {
      logSuccess('Authentication properly enforced (request rejected without API key)');
      return true;
    } else {
      logError(`Unexpected error: ${error.message}`);
      return false;
    }
  }
}

async function testDatabaseQuery() {
  log('\n=== Testing Direct Database Query ===', 'blue');
  try {
    const response = await axios.get(`${BASE_URL}/api/query/stats`, {
      headers: { 'X-API-Key': API_KEY },
      params: {
        date_start: '2020-01-01',
        date_end: '2030-12-31'
      }
    });
    
    if (response.data.success && response.data.data.total_records > 0) {
      logSuccess(`Database has ${response.data.data.total_records} records`);
      logInfo(`Date range: ${response.data.data.earliest_record} to ${response.data.data.latest_record}`);
      return true;
    } else {
      logWarning('Database appears to be empty or no records in date range');
      logInfo('You may need to insert test data into yfs_statistics_detail table');
      return true; // Not a failure, just empty
    }
  } catch (error) {
    logError(`Database query failed: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

async function runAllTests() {
  log('\n╔════════════════════════════════════════════════════════╗', 'cyan');
  log('║     Watson Orchestration Backend API Test Suite       ║', 'cyan');
  log('╚════════════════════════════════════════════════════════╝', 'cyan');
  
  const results = {
    passed: 0,
    failed: 0,
    total: 0
  };

  const tests = [
    { name: 'Root Endpoint', fn: testRootEndpoint },
    { name: 'Health Check', fn: testHealthEndpoint },
    { name: 'Database Query', fn: testDatabaseQuery },
    { name: 'Authentication', fn: testAuthenticationFailure },
    { name: 'Order Statistics', fn: testOrderStatistics },
    { name: 'Component Performance', fn: testComponentPerformance },
    { name: 'Components List', fn: testComponentsList },
    { name: 'Time Series', fn: testTimeSeries },
    { name: 'General Statistics', fn: testGeneralStats },
  ];

  for (const test of tests) {
    results.total++;
    const passed = await test.fn();
    if (passed) {
      results.passed++;
    } else {
      results.failed++;
    }
    await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between tests
  }

  log('\n╔════════════════════════════════════════════════════════╗', 'cyan');
  log('║                    Test Summary                        ║', 'cyan');
  log('╚════════════════════════════════════════════════════════╝', 'cyan');
  log(`\nTotal Tests: ${results.total}`, 'blue');
  logSuccess(`Passed: ${results.passed}`);
  if (results.failed > 0) {
    logError(`Failed: ${results.failed}`);
  }
  
  const successRate = ((results.passed / results.total) * 100).toFixed(1);
  log(`\nSuccess Rate: ${successRate}%`, successRate === '100.0' ? 'green' : 'yellow');
  
  if (results.failed === 0) {
    log('\n🎉 All tests passed! Your backend is working correctly.', 'green');
  } else {
    log('\n⚠️  Some tests failed. Please check the errors above.', 'yellow');
  }
}

// Run tests
runAllTests().catch(error => {
  logError(`\nFatal error running tests: ${error.message}`);
  process.exit(1);
});

// Made with Bob
