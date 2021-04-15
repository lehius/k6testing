import { check } from 'k6';
import { chooseNextCommand, composeCommandsForNext, getRandomValueAndFloor, getRandomValueAndRound } from '../common.js';
import { Component } from '../component/Component.js';
import { test } from './test.js';
export class Clerk extends Component {
  constructor(data, metrics) {
    super('clerk', metrics);
    this.parametrs = data.parametrs;
    this.workplace = data.components[`${__VU}`].workplace;
    this.unlimited = data.parametrs.unlimited;
    this.test = test.bind(this);
    this.isStartingServings = false;
    //for message
    this.id = `${__VU}`;
    this.token = data.components[`${__VU}`].token;
    this.commands4next = composeCommandsForNext(data.parametrs.commands, this.commandSuffix);
    this.version = data.version;
  }
  afterReceivingAllResponses() {
    this.nextCommand();
  }
  stop() {
    if (this.unlimited) {
      this.nextCommand();
    } else {
      super.stop();
    }
  }
  nextCommand() {
    if (!this.responses.currentConsumer) {
      this.nextConsumer_cmd();
      return;
    }
    const command = chooseNextCommand(this.commands4next);
    console.log('clerk', __VU, 'next command:', command);
    if (this[command] && typeof this[command] === 'function') {
      this[command]();
    } else {
      this.serveConsumer_cmd();
    }
  }
  nextConsumer_cmd() {
    this.metrics.tryNextConsumerCount.add(1, {workplace: `${this.workplace}`});
    const timeout = getRandomValueAndRound(this.parametrs.commands.nextConsumer.time_min, this.parametrs.commands.nextConsumer.time_max);
    console.log(`clerk ${__VU} nextConsumer timeout: ${timeout}`);
    this.socket.setTimeout(() => {
      if (this.responses.currentQueue.length > 0) {
        this.send2server('nextConsumer', {workplace:this.workplace}, {currentQueue: this.responses.currentQueue.length});
        this.metrics.nextConsumerCount.add(1, {workplace: `${this.workplace}`});
      } else {
        this.metrics.nextConsumerWithEmptyQueue.add(1);
        this.stop();
      }
      // this.send2server('nextConsumer', {workplace:this.workplace}, {currentQueue: this.responses.currentQueue.length});
    }, timeout)
  }
  nextConsumer_hdl(response) {
    if (response && response.data && response.data.state === 'SERVING') {
      this.metrics.nextConsumerCount.add(1, {workplace: `${this.workplace}`});
      this.responses.currentConsumer = response.data;
      this.nextCommand();
    } else {
      console.warn(`after next consumer not state serving, data: ${JSON.stringify(response)}`);
      this.metrics.afterNextConsumerNotStateServing.add(1);
      this.stop();
    }
  }
  addService_cmd() {
    const timeout = getRandomValueAndRound(this.parametrs.commands.addService.time_min, this.parametrs.commands.addService.time_max);
    console.log(`clerk ${__VU} addService timeout: ${timeout}`);
    this.socket.setTimeout(() => {
      const serviceGroupID = this.me.user.role.clerk.addService_group || 0;
      const services = this.serviceGroupHasServices[serviceGroupID];
      this.send2server('addService', {
        service: services[getRandomValueAndFloor(0, services.length)],
        workplace: this.workplace
      })
    }, timeout)
  }
  addService_hdl(response) {
    this.responses.currentConsumer = response.data;
    this.nextCommand();
  }
  postponeConsumer_cmd() {
    const timeout = getRandomValueAndRound(this.parametrs.commands.postponeConsumer.time_min, this.parametrs.commands.postponeConsumer.time_max);
    console.log(`clerk ${__VU} postponeConsumer timeout: ${timeout}`);
    this.socket.setTimeout(() => {
        this.send2server('postponeConsumer', {
          delay:  getRandomValueAndRound(this.parametrs.commands.postponeConsumer.postpone_min, this.parametrs.commands.postponeConsumer.postpone_max),
          return2me: !!Math.round(Math.random()),
          workplace:this.workplace,
        });
    }, timeout);
  }
  postponeConsumer_hdl(response) {
    this.responses.currentConsumer = null;
    this.stop();
  }
  serveConsumer_cmd() {
    this.metrics.tryServeConsumerCount.add(1, {workplace: `${this.workplace}`});
    const timeout = getRandomValueAndRound(this.parametrs.commands.serveConsumer.time_min, this.parametrs.commands.serveConsumer.time_max);
    console.log(`clerk ${__VU} serveConsumer timeout: ${timeout}`);
    this.socket.setTimeout(() => {
        this.send2server('serveConsumer', {workplace:this.workplace});
        this.metrics.serveConsumerCount.add(1, {workplace: `${this.workplace}`});
    }, timeout);
  }
  serveConsumer_hdl(response) {
    if (response && response.data && response.data.state === 'SERVED') {
      this.responses.currentConsumer = null;
    }
    this.stop();
  }
  rejectConsumer_cmd() {
    const timeout = getRandomValueAndRound(this.parametrs.commands.rejectConsumer.time_min, this.parametrs.commands.rejectConsumer.time_max);
    console.log(`clerk ${__VU} rejectConsumer timeout: ${timeout}`);
    this.socket.setTimeout(() => {
        this.send2server('rejectConsumer', {workplace:this.workplace});
    }, timeout);
  }
  rejectConsumer_hdl(response) {
    this.responses.currentConsumer = null;
    this.stop();
  }
}