const http = require('http');

const API_KEY = 'test-api-key-12345';
const BASE_URL = 'http://localhost:3000';

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'GET',
      headers: {
        'X-API-Key': API_KEY
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function testFilters() {
  console.log('\n=== Testing New Filter Parameters ===\n');

  // Test 1: Filter by service_name
  console.log('1. Filter by service_name (createOrder):');
  try {
    const result = await makeRequest('/api/query/component/performance?component=IKEACreateOrder&service_name=createOrder&date_start=2025-10-21&date_end=2025-10-22');
    console.log(`   ✓ Found ${result.data.length} records for service_name=createOrder`);
    if (result.data.length > 0) {
      console.log(`   - Example: ${result.data[0].service_name} (${result.data[0].service_type})`);
    }
  } catch (e) {
    console.log(`   ✗ Error: ${e.message}`);
  }

  // Test 2: Filter by service_type
  console.log('\n2. Filter by service_type (INTEGRATION):');
  try {
    const result = await makeRequest('/api/query/component/performance?component=IKEACreateOrder&service_type=INTEGRATION&date_start=2025-10-21&date_end=2025-10-22');
    console.log(`   ✓ Found ${result.data.length} records for service_type=INTEGRATION`);
    if (result.data.length > 0) {
      console.log(`   - Example: ${result.data[0].service_name} (${result.data[0].service_type})`);
    }
  } catch (e) {
    console.log(`   ✗ Error: ${e.message}`);
  }

  // Test 3: Filter by statistic_name
  console.log('\n3. Filter by statistic_name (Invocations):');
  try {
    const result = await makeRequest('/api/query/component/performance?component=IKEACreateOrder&statistic_name=Invocations&date_start=2025-10-21&date_end=2025-10-22');
    console.log(`   ✓ Found ${result.data.length} records for statistic_name=Invocations`);
    if (result.data.length > 0) {
      console.log(`   - Example: ${result.data[0].service_name} - ${result.data[0].statistic_name}: ${result.data[0].total_value}`);
    }
  } catch (e) {
    console.log(`   ✗ Error: ${e.message}`);
  }

  // Test 4: Combine multiple filters
  console.log('\n4. Combine filters (service_type=API + statistic_name=Average):');
  try {
    const result = await makeRequest('/api/query/component/performance?component=IKEACreateOrder&service_type=API&statistic_name=Average&date_start=2025-10-21&date_end=2025-10-22');
    console.log(`   ✓ Found ${result.data.length} records for combined filters`);
    if (result.data.length > 0) {
      console.log(`   - Example: ${result.data[0].service_name} (${result.data[0].service_type}) - ${result.data[0].statistic_name}`);
    }
  } catch (e) {
    console.log(`   ✗ Error: ${e.message}`);
  }

  // Test 5: Time series with filters
  console.log('\n5. Time series with service_name filter:');
  try {
    const result = await makeRequest('/api/query/timeseries?component=IKEACreateOrder&service_name=IKEACreateOrderAPIMsgAsyncService_0&statistic_name=Invocations&aggregation=hourly&date_start=2025-10-21&date_end=2025-10-22');
    console.log(`   ✓ Found ${result.data.length} time periods`);
    if (result.data.length > 0) {
      console.log(`   - First period: ${result.data[0].time_period} - ${result.data[0].total_value} invocations`);
    }
  } catch (e) {
    console.log(`   ✗ Error: ${e.message}`);
  }

  // Test 6: Stats endpoint with filters
  console.log('\n6. General stats with service_type filter:');
  try {
    const result = await makeRequest('/api/query/stats?service_type=INTEGRATION&date_start=2025-10-21&date_end=2025-10-22');
    console.log(`   ✓ Statistics retrieved`);
    console.log(`   - Total records: ${result.data.total_records}`);
    console.log(`   - Unique services: ${result.data.unique_services}`);
    console.log(`   - Total value: ${result.data.total_value}`);
  } catch (e) {
    console.log(`   ✗ Error: ${e.message}`);
  }

  console.log('\n=== Filter Testing Complete ===\n');
}

testFilters().catch(console.error);

// Made with Bob
