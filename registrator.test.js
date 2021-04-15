import { Counter, Trend } from 'k6/metrics';
import { Login, Logout } from "./auth/Auth.js";
import { Registrator } from "./registrator/Registrator.js";

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
  servedConsumer: new Trend('served_consumer'),
  conectedCount: new Counter('conected_count'),
  disconectedCount: new Counter('disconected_count'),
  connectionStatesCount: new Counter('connection_states_count'),
  connected: new Trend('connected')
  };

  const users = JSON.parse(open('./options/registrator_auth.json'));
  export let options = {vus: users.length, iterations: users.length, duration: '1h',tags: { "component": "registrator"}};
export function setup() {
  const components = {};
  const count = options.vus || 1;
  for (let i = 1; i <= count; i++) {
    const component = {
      name: 'registrator',
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
  const data = {
    parametrs: {
      new_time_min: 3000,
      new_time_max: 7000,
      consumer_length_min: 30,
      consumer_length_max: 150,
      unlimited: options.iterations === options.vus,
    },
    components
  };

  console.log(`setup ${data.parametrs.unlimited} ${options.iterations} ${options.vus}`)
  return data;
}

export default function (data) {
  const registrator = new Registrator(data, metrics);
  registrator.start(data.unlimited);
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