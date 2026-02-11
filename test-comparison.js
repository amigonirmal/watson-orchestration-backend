const http = require('http');

const API_KEY = 'test-api-key-12345';

function makePostRequest(path, body) {
  return new Promise((resolve, reject) => {
    const bodyStr = JSON.stringify(body);
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'POST',
      headers: {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(bodyStr)
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
    req.write(bodyStr);
    req.end();
  });
}

async function testComparisons() {
  console.log('\n=== Testing Enhanced Component Comparison API ===\n');

  // Test 1: Compare servers by Invocations
  console.log('1️⃣  Compare 3 servers by Invocations (INTEGRATION/AGENT only):');
  try {
    const result = await makePostRequest('/api/query/components/compare', {
      components: ['IKEACreateOrderIntegServer', 'IKEADelArrSolnPurgeAgentServer', 'IkeaCreateWorkOrderIntegServer'],
      statistic_name: 'Invocations',
      date_start: '2025-10-21',
      date_end: '2025-10-22',
      comparison_level: 'server'
    });
    
    console.log(`   ✓ Found ${result.data.length} records`);
    result.data.forEach(row => {
      console.log(`   - ${row.component_name}: ${row.total_value} invocations (avg: ${row.avg_value})`);
    });
  } catch (e) {
    console.log(`   ✗ Error: ${e.message}`);
  }

  // Test 2: Compare servers by Average response time
  console.log('\n2️⃣  Compare servers by Average response time:');
  try {
    const result = await makePostRequest('/api/query/components/compare', {
      components: ['IKEACreateOrderIntegServer', 'IKEADelArrSolnPurgeAgentServer'],
      statistic_name: 'Average',
      date_start: '2025-10-21',
      date_end: '2025-10-22'
    });
    
    console.log(`   ✓ Found ${result.data.length} records`);
    result.data.forEach(row => {
      console.log(`   - ${row.component_name}: ${row.avg_value}ms avg response time`);
    });
  } catch (e) {
    console.log(`   ✗ Error: ${e.message}`);
  }

  // Test 3: Compare servers by Maximum response time
  console.log('\n3️⃣  Compare servers by Maximum response time:');
  try {
    const result = await makePostRequest('/api/query/components/compare', {
      components: ['IKEACreateOrderIntegServer', 'IKEADelArrSolnPurgeAgentServer'],
      statistic_name: 'Maximum',
      date_start: '2025-10-21',
      date_end: '2025-10-22'
    });
    
    console.log(`   ✓ Found ${result.data.length} records`);
    result.data.forEach(row => {
      console.log(`   - ${row.component_name}: ${row.max_value}ms max response time`);
    });
  } catch (e) {
    console.log(`   ✗ Error: ${e.message}`);
  }

  // Test 4: Compare specific service across servers
  console.log('\n4️⃣  Compare specific service (getServerDetails) across servers:');
  try {
    const result = await makePostRequest('/api/query/components/compare', {
      components: ['IKEACreateOrderIntegServer', 'IKEADelArrSolnPurgeAgentServer'],
      service_name: 'getServerDetails',
      statistic_name: 'Invocations',
      date_start: '2025-10-21',
      date_end: '2025-10-22'
    });
    
    console.log(`   ✓ Found ${result.data.length} records`);
    result.data.forEach(row => {
      console.log(`   - ${row.component_name}: ${row.total_value} invocations`);
    });
  } catch (e) {
    console.log(`   ✗ Error: ${e.message}`);
  }

  // Test 5: Compare at service level
  console.log('\n5️⃣  Compare services (service-level comparison):');
  try {
    const result = await makePostRequest('/api/query/components/compare', {
      components: ['createOrder', 'getServerDetails', 'getOrderList'],
      statistic_name: 'Invocations',
      comparison_level: 'service',
      date_start: '2025-10-21',
      date_end: '2025-10-22'
    });
    
    console.log(`   ✓ Found ${result.data.length} records`);
    result.data.forEach(row => {
      console.log(`   - ${row.component_name}: ${row.total_value} invocations`);
    });
  } catch (e) {
    console.log(`   ✗ Error: ${e.message}`);
  }

  // Test 6: Compare INTEGRATION service type only
  console.log('\n6️⃣  Compare servers (INTEGRATION service type only):');
  try {
    const result = await makePostRequest('/api/query/components/compare', {
      components: ['IKEACreateOrderIntegServer', 'IKEADelArrSolnPurgeAgentServer'],
      service_type: 'INTEGRATION',
      statistic_name: 'Invocations',
      date_start: '2025-10-21',
      date_end: '2025-10-22'
    });
    
    console.log(`   ✓ Found ${result.data.length} records`);
    result.data.forEach(row => {
      console.log(`   - ${row.component_name}: ${row.total_value} invocations`);
    });
  } catch (e) {
    console.log(`   ✗ Error: ${e.message}`);
  }

  // Test 7: Compare all statistics for a server
  console.log('\n7️⃣  Compare all statistics for IKEADelArrSolnPurgeAgentServer:');
  try {
    const result = await makePostRequest('/api/query/components/compare', {
      components: ['IKEADelArrSolnPurgeAgentServer'],
      date_start: '2025-10-21',
      date_end: '2025-10-22'
    });
    
    console.log(`   ✓ Found ${result.data.length} records`);
    const stats = {};
    result.data.forEach(row => {
      if (!stats[row.statistic_name]) stats[row.statistic_name] = [];
      stats[row.statistic_name].push(row);
    });
    Object.keys(stats).forEach(stat => {
      console.log(`   - ${stat}: ${stats[stat].length} records`);
    });
  } catch (e) {
    console.log(`   ✗ Error: ${e.message}`);
  }

  console.log('\n=== Comparison Testing Complete ===\n');
}

testComparisons().catch(console.error);

// Made with Bob
