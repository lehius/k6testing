import { test } from "./test.js";
import { Socket } from "../socket/Socket.js";

export class Creator extends Socket {
  constructor(metrics) {
    super(metrics);
    this.test = test.bind(this);
  }
  socket_connected() {
    this.login_cmd();
  }
  login_cmd() {
    this.send2socket('login', {
      component: 'workplace',
      login: 'admin',
      password: '827ccb0eea8a706c4c34a16891f84e7b',
      workplace: 1
    })
  }
  login_hdl(response) {
    console.log(`login_hdl ${JSON.stringify(response)}`);
    this.token = response.token;
    this.test();
  }
  newOperation_cmd(name, regulated_sec) {
    this.send2socket('newOperation', {
      name,
      regulated_sec,
      description: ''
    });
  }
  operationList_cmd() {
    this.send2socket('operationList', {});
  }
  operationList_hdl(response) {
    this.operationList = response.data;
    console.log(`operationList_hdl ${JSON.stringify(response)}`);
  }
  newTicketRange_cmd(name) {
    this.send2socket('newTicketRange', {
      name,
      ticketMin: 1,
      ticketMax: 999,
      ticketNumberMinWidth: 3,
      ticketNumberMaxWidth: 4,
      clearNumberEvery: 'NONE',
      cycledCounter: true,
      description: ''
    });
  }
  ticketRangeList_cmd() {
    this.send2socket('ticketRangeList', {});
  }
  ticketRangeList_hdl(response) {
    this.ticketRangeList = response.data;
  }
  newService_cmd(name, ticket_range_id, operations) {
    this.send2socket('newService', {
      name,
      ticket_range_id,
      priority: 50,
      registrable: true,
      dynamic: false,
      operations,
      description: ''
    });
  }
  newWorkplace_cmd(name) {
    this.send2socket('newWorkplace', {
      name,
      alias: name,
      wpd_filter: null,
      audio_zone: null,
      all_operations: true,
      operations: [],
      auto_call: false,
      auto_call_timeout: 0,
      auto_serve: false,
      auto_serve_timeout: 0,
      description: ''
    });
  }
  setUserRoleAllOperations_cmd() {
    this.send2socket('setUserRole',{id: 3, clerk: {all_operations: true}});
  }
  newUser_cmd(name) {
    this.send2socket('newUser', {
      login: name,
      password: name,
      role_id: 3
    })
  }
}