import { sleep } from "k6";
import { getServicesFromServiceGroupList } from "../common.js";
import { serviceGroup } from "../serviceGroup.js";
import { Socket } from "../socket/Socket.js";

export class Component extends Socket {
  constructor(name, metrics) {
    super(metrics);
    this.name = name;
  }
  afterReceivingAllResponses() {}
  emitResponse() {
    if (this.recievedAllResponses) {
      return;
    }
    const len = Object.keys(this.responses).length;
    console.log(`${this.name} ${__VU} recieve responses: ${len}/${this.responseCount}`);
    if (len < this.responseCount) {
      return;
    }
    this.recievedAllResponses = true;
    this.afterReceivingAllResponses();
  }
  test() {}
  socket_connected() {
    // super.socket_connected();
    if (!this.isAuth) {
      this.metrics.conectedCount.add(1, {component: `${this.name} ${__VU}`});
      this.metrics.connectionStatesCount.add(1, {state: 'connected', component: `${this.name} ${__VU}`});
      this.metrics.connected.add(1, {component: `${this.name} ${__VU}`});
    }
    console.log(`connected ${this.name} ${__VU}`);
    this.me_cmd();
  }
  socket_disconnected() {
    // super.socket_disconnected();
    if (!this.isAuth) {
      this.metrics.disconectedCount.add(1, {component: `${this.name} ${__VU}`});
      this.metrics.connectionStatesCount.add(1, {state: 'disconnected', component: `${this.name} ${__VU}`});
      this.metrics.connected.add(-1, {component: `${this.name} ${__VU}`});
    }
    console.log(`disconnected ${this.name} ${__VU}, last command ${this.lastCommand}`);
    if (this.isWorking) {
      this.socket = null;
      sleep(1);
      this.initSocket();
    }
  }
  send2server(command, data, extra) {
    console.log(`${this.name} ${__VU} send: command: ${command}, data: ${JSON.stringify(data)}, ${extra ? 'extra : ' + JSON.stringify(extra) : ''}`);
    this.send2socket(command, data);
  }
//------------------------------------------------------------------------------
//API commands
//------------------------------------------------------------------------------
  //----------------------------------------------------------------------------
  // me
  //----------------------------------------------------------------------------
  me_cmd() {
    this.send2server('me', {});
  }
  me_hdl(response) {
    this.me = response.data || {};
    this.responses = {};
    this.responseCount = 0;
    this.recievedAllResponses = false;
    this.serviceGroupHasServices = {};
    this.test();
  }
  //----------------------------------------------------------------------------
  // current queue2
  //----------------------------------------------------------------------------
  subscribeCurrentQueue2_cmd(data) {
    this.send2server('subscribeCurrentQueue2', data);
  }
  currentQueue2_cmd(data) {
    this.send2server('currentQueue2', data);
  }
  currentQueue2_hdl(response) {
    this.responses.currentQueue = response.data.list || [];
    this.emitResponse();
  }
  //----------------------------------------------------------------------------
  // current queue
  //----------------------------------------------------------------------------
  subscribeCurrentQueue_cmd(data) {
    this.send2server('subscribeCurrentQueue', data);
  }
  currentQueue_cmd(data) {
    this.send2server('currentQueue', data);
  }
  currentQueue_hdl(response) {
    this.responses.currentQueue = response.data || [];
    this.emitResponse();
  }
  //----------------------------------------------------------------------------
  // operation
  //----------------------------------------------------------------------------
  subscribeOperations_cmd() {
    this.send2server('subscribeOperations', {});
  }
  operationList_cmd() {
    this.send2server('operationList', {});
  }
  operationList_hdl(response) {
    this.responses.operationList = response.data || [];
    this.emitResponse();
  }
  //----------------------------------------------------------------------------
  // service
  //----------------------------------------------------------------------------
  subscribeServices_cmd() {
    this.send2server('subscribeServices', {});
  }
  serviceList_cmd() {
    this.send2server('serviceList', {});
  }
  serviceList_hdl(response) {
    this.responses.serviceList = response.data || [];
    this.serviceGroupHasServices[0] = this.responses.serviceList.map(service => service.id);
    this.emitResponse();
  }
  //----------------------------------------------------------------------------
  // service group
  //----------------------------------------------------------------------------
  subscribeServiceGroups_cmd() {
    this.send2server('subscribeServiceGroups', {});
  }
  serviceGroupList_cmd() {
    this.send2server('serviceGroupList', {});
  }
  serviceGroupList_hdl(response) {
    this.responses.serviceGroupList = response.data || [];
    this.serviceGroupHasServices = Object.assign(
      this.serviceGroupHasServices,
      getServicesFromServiceGroupList(this.responses.serviceGroupList)
    );
    this.emitResponse();
  }
  //----------------------------------------------------------------------------
  // workplace
  //----------------------------------------------------------------------------
  subscribeWorkplaces_cmd() {
    this.send2server('subscribeWorkplaces', {});
  }
  workplaceList_cmd() {
    this.send2server('workplaceList', {});
  }
  workplaceList_hdl(response) {
    this.responses.workplaceList = response.data || [];
    this.emitResponse();
  }
  //----------------------------------------------------------------------------
  // user
  //----------------------------------------------------------------------------
  subscribeUsers_cmd() {
    this.send2server('subscribeUsers', {});
  }
  userList_cmd() {
    this.send2server('userList', {});
  }
  userList_hdl(response) {
    this.responses.userList = response.data || [];
    this.emitResponse();
  }
  //----------------------------------------------------------------------------
  // consumer
  //----------------------------------------------------------------------------
  subscribeConsumers_cmd() {
    this.send2server('subscribeConsumers', {});
  }
  consumerList_cmd() {
    this.send2server('consumerList', {});
  }
  consumerList_hdl(response) {
    this.responses.consumerList = response.data || null;
    console.log('current queue:',this.responses.consumerList.length);
    this.metrics.queueLength.add(this.responses.consumerList.length);
    this.metrics.servedConsumer.add(
      this.responses.consumerList.filter(consumer => consumer.state === 'SERVED').length
    );
    this.emitResponse();
  }
  //----------------------------------------------------------------------------
  // current consumer
  //----------------------------------------------------------------------------
  currentConsumer_cmd() {
    this.send2server('currentConsumer', {workplace: this.me.workplace.id});
  }
  currentConsumer_hdl(response) {
    this.responses.currentConsumer = response.data || null;
    this.emitResponse();
  }
}