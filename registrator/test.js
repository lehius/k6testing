import { incrementTimeout } from "../common.js";
export function test() {
  const requests = [
    {command: this.subscribeServices_cmd.bind(this), timeout: incrementTimeout(250, 750), needWaitResponse: false},
    {command: this.serviceList_cmd.bind(this), timeout: incrementTimeout(250, 750), needWaitResponse: true},
    {command: this.subscribeServiceGroups_cmd.bind(this), timeout: incrementTimeout(250, 750), needWaitResponse: false},
    {command: this.serviceGroupList_cmd.bind(this), timeout: incrementTimeout(250, 750), needWaitResponse: true},
    {command: this.consumerList_cmd.bind(this), timeout: incrementTimeout(250, 750), needWaitResponse: true}
  ];
  if (this.unlimited) {
    requests.push({command: this.subscribeConsumers_cmd.bind(this), timeout: incrementTimeout(250, 750), needWaitResponse: false})
  }
  this.responseCount = requests.filter(request => request.needWaitResponse).length;
  requests.forEach(request => {
    this.socket.setTimeout(request.command, request.timeout);
  })
}