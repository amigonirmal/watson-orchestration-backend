const https = require('https');
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/query/components/list?search=IKEACreateOrder&limit=1',
  method: 'GET',
  headers: {
    'X-API-Key': 'test-api-key-12345'
  }
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      const services = new Map();
      
      json.data[0].categories.forEach(cat => {
        const key = `${cat.service_name}|${cat.service_type}`;
        services.set(key, { service_name: cat.service_name, service_type: cat.service_type });
      });
      
      console.log('\n=== Services under IKEACreateOrderIntegServer ===\n');
      Array.from(services.values())
        .sort((a, b) => a.service_name.localeCompare(b.service_name))
        .forEach(s => {
          console.log(`${s.service_name} - ${s.service_type}`);
        });
      console.log(`\nTotal unique services: ${services.size}`);
    } catch (e) {
      console.error('Error parsing JSON:', e.message);
    }
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.end();

// Made with Bob
