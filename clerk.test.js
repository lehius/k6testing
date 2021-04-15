import { Clerk } from "./clerk/Clerk.js";
import { Counter, Trend } from 'k6/metrics';
import { Login, Logout } from "./auth/Auth.js";
import { sleep } from "k6";
import { getRandomValueAndRound } from "./common.js";

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
  nextConsumerWithEmptyQueue: new Counter('next_consumer_with_empty_queue'),
  afterNextConsumerNotStateServing: new Counter('after_next_consumer_not_state_serving'),
  conectedCount: new Counter('conected_count'),
  disconectedCount: new Counter('disconected_count'),
  connectionStatesCount: new Counter('connection_states_count'),
  connected: new Trend('connected')
  };

const users = JSON.parse(open('./options/clerk_auth.json'));

const VERSION = '1.24';
export let options = {vus: users.length, iterations: users.length, duration: '1h',tags: {"component": "clerk"}};
export function setup() {
  const components = {};
  const count = options.vus || 1;
  for (let i = 1; i <= count; i++) {
    const component = {
      name: 'workplace',
      login: `${users[i-1].login}`,
      password: `${users[i-1].password}`,
      workplace: users[i-1].workplace,
      vu: `${i}`
    };
    const login = new Login({component, components} , metrics);
    login.start();
  }
  var data = {
    parametrs: {
      commands: {
        nextConsumer: {
          time_min: 2000,
          time_max: 14000,
        },
        addService: {
          time_min: 30000,
          time_max: 60000,
          chance: 7
        },
        postponeConsumer: {
          time_min: 30000,
          time_max: 60000,
          postpone_min: 1,
          postpone_max: 5,
          chance: 7
        },
        serveConsumer: {
          time_min: 30000,
          time_max: 90000,
          chance: 70
        },
        rejectConsumer: {
          time_min: 30000,
          time_max: 60000,
          chance: 16
        }
      },
      unlimited: options.iterations === options.vus,
    },
    components,
    version: VERSION
  }
  console.log(`setup ${data.parametrs.unlimited} ${options.iterations} ${options.vus}`);
  console.log('');
  console.log('');
  console.log('');
  return data;
}

export default function (data) {
  const clerk = new Clerk(data, metrics);
  sleep((+__VU)*getRandomValueAndRound(2,5));
  console.log(`clerk ${__VU} start time ${new Date()}`);
  clerk.start();
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