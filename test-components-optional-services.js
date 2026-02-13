const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testComponentsList() {
  console.log('='.repeat(80));
  console.log('Testing Components List API - Optional Services Parameter');
  console.log('='.repeat(80));
  console.log();

  try {
    // Test 1: Default behavior (no services)
    console.log('Test 1: Default behavior (include_services not specified)');
    console.log('-'.repeat(80));
    const response1 = await axios.get(`${BASE_URL}/api/query/components/list`, {
      params: {
        limit: 5
      }
    });
    
    console.log('Status:', response1.status);
    console.log('Metadata:', JSON.stringify(response1.data.metadata, null, 2));
    console.log('Sample data (first 2 servers):');
    console.log(JSON.stringify(response1.data.data.slice(0, 2), null, 2));
    console.log();

    // Test 2: Explicitly set to false
    console.log('Test 2: Explicitly set include_services=false');
    console.log('-'.repeat(80));
    const response2 = await axios.get(`${BASE_URL}/api/query/components/list`, {
      params: {
        limit: 5,
        include_services: 'false'
      }
    });
    
    console.log('Status:', response2.status);
    console.log('Metadata:', JSON.stringify(response2.data.metadata, null, 2));
    console.log('Sample data (first 2 servers):');
    console.log(JSON.stringify(response2.data.data.slice(0, 2), null, 2));
    console.log();

    // Test 3: Set to 'N'
    console.log('Test 3: Set include_services=N');
    console.log('-'.repeat(80));
    const response3 = await axios.get(`${BASE_URL}/api/query/components/list`, {
      params: {
        limit: 5,
        include_services: 'N'
      }
    });
    
    console.log('Status:', response3.status);
    console.log('Metadata:', JSON.stringify(response3.data.metadata, null, 2));
    console.log('Sample data (first 2 servers):');
    console.log(JSON.stringify(response3.data.data.slice(0, 2), null, 2));
    console.log();

    // Test 4: Include services with 'true'
    console.log('Test 4: Include services (include_services=true)');
    console.log('-'.repeat(80));
    const response4 = await axios.get(`${BASE_URL}/api/query/components/list`, {
      params: {
        limit: 3,
        include_services: 'true'
      }
    });
    
    console.log('Status:', response4.status);
    console.log('Metadata:', JSON.stringify(response4.data.metadata, null, 2));
    console.log('Sample data (first server with services):');
    console.log(JSON.stringify(response4.data.data.slice(0, 1), null, 2));
    console.log();

    // Test 5: Include services with 'Y'
    console.log('Test 5: Include services (include_services=Y)');
    console.log('-'.repeat(80));
    const response5 = await axios.get(`${BASE_URL}/api/query/components/list`, {
      params: {
        limit: 3,
        include_services: 'Y'
      }
    });
    
    console.log('Status:', response5.status);
    console.log('Metadata:', JSON.stringify(response5.data.metadata, null, 2));
    console.log('Sample data (first server with services):');
    console.log(JSON.stringify(response5.data.data.slice(0, 1), null, 2));
    console.log();

    // Test 6: With search term and no services
    console.log('Test 6: Search with no services (search=YFS, include_services=N)');
    console.log('-'.repeat(80));
    const response6 = await axios.get(`${BASE_URL}/api/query/components/list`, {
      params: {
        search: 'YFS',
        limit: 5,
        include_services: 'N'
      }
    });
    
    console.log('Status:', response6.status);
    console.log('Metadata:', JSON.stringify(response6.data.metadata, null, 2));
    console.log('Sample data (first 3 servers):');
    console.log(JSON.stringify(response6.data.data.slice(0, 3), null, 2));
    console.log();

    // Test 7: With search term and services
    console.log('Test 7: Search with services (search=YFS, include_services=true)');
    console.log('-'.repeat(80));
    const response7 = await axios.get(`${BASE_URL}/api/query/components/list`, {
      params: {
        search: 'YFS',
        limit: 2,
        include_services: 'true'
      }
    });
    
    console.log('Status:', response7.status);
    console.log('Metadata:', JSON.stringify(response7.data.metadata, null, 2));
    console.log('Sample data (first server with services):');
    console.log(JSON.stringify(response7.data.data.slice(0, 1), null, 2));
    console.log();

    console.log('='.repeat(80));
    console.log('✅ All tests completed successfully!');
    console.log('='.repeat(80));

  } catch (error) {
    console.error('❌ Error during testing:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
    process.exit(1);
  }
}

// Run the tests
testComponentsList();

// Made with Bob
