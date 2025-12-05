import http from 'k6/http';
import { sleep } from 'k6';

export let options = {
  stages: [
    { duration: '10s', target: 20 }, // ramp-up
    { duration: '20s', target: 20 }, // stay
    { duration: '10s', target: 0 },  // ramp-down
  ],
};

export default function () {
  http.get('http://localhost:8080');
  sleep(1);
}
