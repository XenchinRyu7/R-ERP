import http from 'k6/http';
import { check } from 'k6';

const TARGET_HOST = __ENV.TARGET_HOST || 'http://localhost';

export const options = {
    stages: [
    { duration: '15s', target: 200 },
    { duration: '30s', target: 800 },
    { duration: '1m', target: 1200 },
    { duration: '15s', target: 0 },
    { duration: '30s', target: 2000 },
    { duration: '30s', target: 1000 },
    { duration: '15s', target: 0 }
  ],
  
  thresholds: {
    http_req_failed: ['rate>0.10'],
  },
};

export default function () {
  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'k6-chaos-spike/1.0',
    },
    timeout: '15s', 
  };

  // Tembak URL utama web ERP langsung
  const res = http.get(`${TARGET_HOST}/`, params);

  check(res, {
    'HTTP 200 OK': (r) => r.status === 200,
  });
}
