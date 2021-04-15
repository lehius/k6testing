import { Counter, Trend } from 'k6/metrics';
import { Login, Logout } from "./auth/Auth.js";
import { Qboard } from "./qboard/Qboard.js";

const metrics = {
  serverWaitingTimeOnCommand: new Trend('server_waiting_time_on_command', true),
  queueLength: new Trend('queue_length'),
  subscribeMessageCount: new Counter('subscribe_message_count'),
  tryNextConsumerCount: new Counter('try_next_consumer_count'),
  nextConsumerCount: new Counter('next_consumer_count'),
  tryServeConsumerCount: new Counter('try_serve_consumer_count'),
  serveConsumerCount: new Counter('serve_consumer_count'),
  socketError: new Counter('socket_error'),
  clientCount: new Trend('client_count'),
  disconectedCount: new Counter('disconected_count')
  };

const users = JSON.parse(open('./options/qboard_auth.json'));
export let options = {vus: users.length, duration: '1h'};
export function setup() {
  const components = {};
  const count = options.vus || 1;
  for (let i = 1; i <= count; i++) {
    const component = {
      name: 'qboard',
      login: `${users[i-1].login}`,
      vu: `${i}`
    };
    const login = new Login({component, components}, metrics);
    login.start();
  }
  console.log(`components: ${JSON.stringify(components)}`);
  if(!options.iterations || options.iterations < options.vus) {
    options.iterations = options.vus;
  }
  return {
    parametrs: {
      new_time_min: 300,
      new_time_max: 1*1000,
      consumer_length_min: 100,
      consumer_length_max: 150,
      priority: 50,
      unlimited: options.iterations === options.vus,
    },
    components
  }
}

export default function (data) {
  const qboard = new Qboard(data, metrics);
  qboard.start(data.unlimited);
}

export function teardown(data) {
  console.log('teardown');
  for (let key in data.components) {
    const component = data.components[key];
    const logout = new Logout(component, metrics);
    logout.start();
  }
  return;
}