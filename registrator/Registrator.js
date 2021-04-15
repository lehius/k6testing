import { test } from "./test.js";
import { getRandomValueAndFloor, getRandomValueAndRound } from "../common.js";
import { Component } from "../component/Component.js";

export class Registrator extends Component{
  constructor(data, metrics) {
    super('registrator', metrics);
    this.parametrs = data.parametrs;
    this.unlimited = data.parametrs.unlimited;
    this.test = test.bind(this);
    this.responses = {};
    this.isStartingRegistration = false;
    this.registering = false;
    //for message
    this.id = `${__VU}`;
    this.token = data.components[`${__VU}`].token;
  }
  afterReceivingAllResponses() {
    this.newConsumer_cmd();
  }
  stop() {
    if (this.unlimited) {
      this.newConsumer_cmd();
    } else {
      super.stop();
    }
  }
  needNewConsumer() {
    if (this.responses.consumerList.length >= this.parametrs.consumer_length_max) {
      return this.registering = false;
    } else if (!this.registering && this.responses.consumerList.length  >= this.parametrs.consumer_length_min) {
      return false;
    }
    return this.registering = true;
  }
  newConsumer_cmd() {
    const timeout = getRandomValueAndRound(this.parametrs.new_time_min, this.parametrs.new_time_max);
    console.log(`registrator ${__VU} newConsumer timeout: ${timeout}`);
    this.socket.setTimeout(() => {
      if (this.needNewConsumer()) {
        const serviceGroup_id = this.me.component.serviceGroup_id || 0;
        const services = this.serviceGroupHasServices[serviceGroup_id];
        this.send2server('newConsumer', {
          services: [services[getRandomValueAndFloor(0, services.length)]],
          priority: this.me.component.priority || 0,
        });
      } else {
        console.log('registrstion in pause');
        this.stop();
      }
    }, timeout);
  }
  newConsumer_hdl( ) {
    this.stop();
  }
}