import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom Metrics
const failureRate = new Rate('failed_requests');
const analyticsDuration = new Trend('analytics_response_time');
const inventoryDuration = new Trend('inventory_response_time');
const masterDataDuration = new Trend('masterdata_response_time');

const TARGET_HOST = __ENV.TARGET_HOST || 'http://localhost';

export const options = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '1m',  target: 100 },
    { duration: '1m',  target: 300 },
    { duration: '45s', target: 600 },
    { duration: '30s', target: 0 },
  ],

  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<1000'],
    'failed_requests': ['rate<0.05'],
  },
};

export default function () {
  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'k6-load-testing-suite/1.0',
    },
    timeout: '10s',
  };

  group('Executive Analytics Dashboard', function () {
    const res = http.get(`${TARGET_HOST}/api/analytics/dashboard`, params);
    analyticsDuration.add(res.timings.duration);

    const success = check(res, {
      'Analytics HTTP 200': (r) => r.status === 200,
      'Analytics body contains kpis': (r) => r.body && r.body.includes('revenue'),
    });

    if (!success) {
      failureRate.add(1);
    }
  });

  sleep(0.5);

  group('Warehouse Inventory Stocks', function () {
    const res = http.get(`${TARGET_HOST}/api/inventory/stocks`, params);
    inventoryDuration.add(res.timings.duration);

    const success = check(res, {
      'Inventory HTTP 200': (r) => r.status === 200,
    });

    if (!success) {
      failureRate.add(1);
    }
  });

  sleep(0.5);

  group('Master Data Products Catalog', function () {
    const res = http.get(`${TARGET_HOST}/api/master-data/products`, params);
    masterDataDuration.add(res.timings.duration);

    const success = check(res, {
      'Master Data HTTP 200': (r) => r.status === 200,
    });

    if (!success) {
      failureRate.add(1);
    }
  });

  sleep(1);
}
