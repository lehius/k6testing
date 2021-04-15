import ws from 'k6/ws'
import { check, sleep } from 'k6'
import { url } from '../config.js';
import { getRandomValueAndRound } from '../common.js';
export class Socket {
  constructor(metrics) {
    this.name = 'Socket';
    this.socket = null;
    this.commands = {};
    this.commandSuffix = '_cmd';
    this.handlerSuffix = '_hdl';
    this.metrics = metrics;
    this.isAuth = false;
    this.lastCommand = '';
    this.isWorking = true;
    this.commandHandler = new Map();
  }
  initSocket() {
    return ws.connect(url, {}, socket => {
      this.socket = socket;

      this.socket.on('open', this.socket_connected.bind(this));

      this.socket.on('error', this.socket_error.bind(this));

      this.socket.on('message',this.socket_message.bind(this));

      this.socket.on('close', this.socket_disconnected.bind(this));
    });
  }
  socket_connected() {
    console.log('connected');
  }
  socket_disconnected() {
    if (!this.isAuth) {
      this.metrics.disconectedCount.add(1, {last_command: this.lastCommand});
    }
    console.log(`diconnected2 ${this.name} ${__VU}`);
  }
  start() {
    const response = this.initSocket();
    check(response, {
      'http status is 101': (r) => r && r.status === 101,
    });
  }
  stop() {
    if (!this.isAuth) {
      sleep(1);
    }
    console.log(`stop ${this.name} ${__VU}`);
    this.isWorking = false;
    this.socket.close();
  }
  socket_error(e) {
    this.metrics.socketError.add(1, {message: e.error()});
    if (e.error() != 'websocket: close sent') {
      console.warn('An unexpected error occured: ', e.error());
    }
  }
  subscribeToCommand(command, cb) {
    const subscribers = this.commandHandler.get(command) || [];
    subscribers.push(cb);
    this.commandHandler.set(command, subscribers);
    return () => this.commandHandler.delete(command);
  }
  socket_message(data) {
    const message = data.length > 150 ? data.slice(0,150) + '...' : data;
    console.log('Message received: ', message);
    const response = JSON.parse(data);

    check(response, {
      'no error': (r) => r && !r.hasOwnProperty('error'),
    });
    if (response.error) {
      console.warn('Response error: ', JSON.stringify(response.error));
    }
    if (!this.isAuth && !response.id) {
      this.metrics.subscribeMessageCount.add(1, {command: response.command, clerk: `${__VU}`});
    }
    if (this.commands[response.command]) {
      const timeout = new Date() - this.commands[response.command].time;
      console.log(`${this.name}: ${__VU}, command: ${response.command}, timeout: ${timeout}`);
      this.metrics.serverWaitingTimeOnCommand.add(timeout, {command: response.command});
      delete this.commands[response.command];
    }
    const command = response.command + this.handlerSuffix;
    if (this[command] && typeof this[command] === 'function') {
      this.socket.setTimeout(() => {this[command](response)}, getRandomValueAndRound(25, 50));
    }
  }

  send2socket(command, data) {
    this.commands[command] = {time: new Date()};
    const request = JSON.stringify({token: this.token, command: command, id: this.id, data: data});
    this.socket.send(request);
    // console.log(`send2socket clerk${__VU}: ${request}`);
    this.lastCommand = command;
  }

}