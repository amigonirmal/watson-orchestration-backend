const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const API_KEY = process.env.API_KEY || 'your-api-key-here';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'X-API-Key': API_KEY,
    'Content-Type': 'application/json'
  }
});

async function testComponentsList() {
  console.log('🧪 Testing Optimized /api/query/components/list Endpoint\n');
  console.log('='.repeat(70));
  
  try {
    // Test 1: Get all components (no filters)
    console.log('\n📋 Test 1: Get all components (default limit: 300)');
    console.log('-'.repeat(70));
    const startTime1 = Date.now();
    const response1 = await api.get('/api/query/components/list');
    const duration1 = Date.now() - startTime1;
    
    console.log(`✅ Status: ${response1.status}`);
    console.log(`⏱️  Response Time: ${duration1}ms`);
    console.log(`📊 Servers Returned: ${response1.data.data.length}`);
    console.log(`🔧 Query Optimization: ${response1.data.metadata.query_optimization}`);
    
    if (response1.data.data.length > 0) {
      const firstServer = response1.data.data[0];
      console.log(`\n📦 Sample Server: ${firstServer.server_name}`);
      console.log(`   Total Services: ${firstServer.services.length}`);
      
      if (firstServer.services.length > 0) {
        console.log(`\n   Sample Service:`);
        const svc = firstServer.services[0];
        console.log(`   - Service Name: ${svc.service_name}`);
        console.log(`   - Service Type: ${svc.service_type}`);
        console.log(`   - Context: ${svc.context_name}`);
        console.log(`   - Statistics: [${svc.statistic_names.join(', ')}]`);
      }
    }
    
    // Test 2: Search with filter
    console.log('\n\n📋 Test 2: Search for specific server (YFSAPP01)');
    console.log('-'.repeat(70));
    const startTime2 = Date.now();
    const response2 = await api.get('/api/query/components/list?search=YFSAPP01');
    const duration2 = Date.now() - startTime2;
    
    console.log(`✅ Status: ${response2.status}`);
    console.log(`⏱️  Response Time: ${duration2}ms`);
    console.log(`📊 Servers Returned: ${response2.data.data.length}`);
    console.log(`🔍 Search Term: ${response2.data.metadata.searchTerm}`);
    
    if (response2.data.data.length > 0) {
      const server = response2.data.data[0];
      console.log(`\n📦 Server: ${server.server_name}`);
      console.log(`   Total Services: ${server.services.length}`);
      
      if (server.services.length > 0) {
        console.log(`\n   First 3 Services:`);
        server.services.slice(0, 3).forEach((svc, idx) => {
          console.log(`   ${idx + 1}. ${svc.service_name} (${svc.service_type})`);
          console.log(`      Statistics: [${svc.statistic_names.join(', ')}]`);
        });
      }
    }
    
    // Test 3: Limited results
    console.log('\n\n📋 Test 3: Get limited results (limit: 5)');
    console.log('-'.repeat(70));
    const startTime3 = Date.now();
    const response3 = await api.get('/api/query/components/list?limit=5');
    const duration3 = Date.now() - startTime3;
    
    console.log(`✅ Status: ${response3.status}`);
    console.log(`⏱️  Response Time: ${duration3}ms`);
    console.log(`📊 Servers Returned: ${response3.data.data.length}`);
    console.log(`🎯 Limit Applied: ${response3.data.metadata.limit}`);
    
    console.log('\n   Servers:');
    response3.data.data.forEach((server, index) => {
      console.log(`   ${index + 1}. ${server.server_name} (${server.services.length} services)`);
    });
    
    // Test 4: Partial search
    console.log('\n\n📋 Test 4: Partial search (search: APP)');
    console.log('-'.repeat(70));
    const startTime4 = Date.now();
    const response4 = await api.get('/api/query/components/list?search=APP&limit=10');
    const duration4 = Date.now() - startTime4;
    
    console.log(`✅ Status: ${response4.status}`);
    console.log(`⏱️  Response Time: ${duration4}ms`);
    console.log(`📊 Servers Returned: ${response4.data.data.length}`);
    console.log(`🔍 Search Term: ${response4.data.metadata.searchTerm}`);
    
    // Performance Summary
    console.log('\n\n📈 Performance Summary');
    console.log('='.repeat(70));
    console.log(`Test 1 (All components): ${duration1}ms`);
    console.log(`Test 2 (Specific search): ${duration2}ms`);
    console.log(`Test 3 (Limited results): ${duration3}ms`);
    console.log(`Test 4 (Partial search):  ${duration4}ms`);
    console.log(`\nAverage Response Time: ${Math.round((duration1 + duration2 + duration3 + duration4) / 4)}ms`);
    
    // Data Structure Validation
    console.log('\n\n✅ Data Structure Validation');
    console.log('='.repeat(70));
    const sample = response1.data.data[0];
    console.log('Required fields present:');
    console.log(`  ✓ server_name: ${!!sample.server_name}`);
    console.log(`  ✓ services: ${Array.isArray(sample.services)}`);
    
    if (sample.services.length > 0) {
      const svc = sample.services[0];
      console.log('\nService fields present:');
      console.log(`  ✓ service_name: ${!!svc.service_name}`);
      console.log(`  ✓ service_type: ${!!svc.service_type}`);
      console.log(`  ✓ context_name: ${!!svc.context_name}`);
      console.log(`  ✓ statistic_names: ${Array.isArray(svc.statistic_names)}`);
      console.log(`  ✓ statistic_names count: ${svc.statistic_names.length}`);
    }
    
    console.log('\n\n🎉 All tests completed successfully!');
    console.log('='.repeat(70));
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

// Run tests
console.log('🚀 Starting Component List API Tests');
console.log(`📍 API Base URL: ${API_BASE_URL}`);
console.log(`🔑 Using API Key: ${API_KEY.substring(0, 10)}...`);

testComponentsList();

// Made with Bob
