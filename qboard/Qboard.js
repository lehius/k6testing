import { Component } from "../component/Component.js";
import { test } from "./test.js";

export class Qboard extends Component {
  constructor(options, metrics) {
    super('qboard', metrics);
    this.unlimited = options.parametrs.unlimited;
    this.test = test.bind(this);
    //for message
    this.id = `${__VU}`;
    this.token = options.components[`${__VU}`].token;
  }
  afterReceivingAllResponses() {
    if (!this.unlimited) {
      this.stop();
    }
  }
}