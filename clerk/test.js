import { incrementTimeout } from "../common.js";

export function test() {
  const requests = [
    {command: this.subscribeOperations_cmd.bind(this), timeout: incrementTimeout(250, 750), needWaitResponse: false},
    {command: this.operationList_cmd.bind(this), timeout: incrementTimeout(250, 750), needWaitResponse: true},
    {command: this.subscribeServices_cmd.bind(this), timeout: incrementTimeout(250, 750), needWaitResponse: false},
    {command: this.serviceList_cmd.bind(this), timeout: incrementTimeout(250, 750), needWaitResponse: true},
    {command: this.subscribeServiceGroups_cmd.bind(this), timeout: incrementTimeout(250, 750), needWaitResponse: false},
    {command: this.serviceGroupList_cmd.bind(this), timeout: incrementTimeout(250, 750), needWaitResponse: true},
    {command: this.subscribeUsers_cmd.bind(this), timeout: incrementTimeout(250, 750), needWaitResponse: false},
    {command: this.userList_cmd.bind(this), timeout: incrementTimeout(250, 750), needWaitResponse: true},
    {command: this.currentConsumer_cmd.bind(this), timeout: incrementTimeout(250, 750), needWaitResponse: true}
  ];
  const commandForAdd = this.version === '1.23'
  ? [
    {command: this.subscribeWorkplaces_cmd.bind(this), timeout: incrementTimeout(250, 750), needWaitResponse: false},
    {command: this.workplaceList_cmd.bind(this), timeout: incrementTimeout(250, 750), needWaitResponse: true},
    {command: () => {
      this.subscribeCurrentQueue_cmd({detailed:false, workplace:this.workplace})
    }, timeout: incrementTimeout(250, 750), needWaitResponse: false},
    {command: () => {
      this.currentQueue_cmd({detailed:false, workplace: this.workplace})
    }, timeout: incrementTimeout(250, 750), needWaitResponse: true}
  ]
  : [
    {command: () => {
      this.subscribeCurrentQueue2_cmd({detailed:false, workplace:this.workplace, size: 0})
    }, timeout: incrementTimeout(250, 750), needWaitResponse: false},
    {command: () => {
      this.currentQueue2_cmd({detailed:false, workplace: this.workplace, size: 0})
    }, timeout: incrementTimeout(250, 750), needWaitResponse: true}
  ];
  commandForAdd.forEach(command => {
    requests.push(command);
  });
  this.responseCount = requests.filter(request => request.needWaitResponse).length;
  requests.forEach(request => {
    this.socket.setTimeout(request.command, request.timeout);
  });
}

