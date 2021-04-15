import { sleep } from 'k6';
export function test() {
  // for (let i = 0; i < 10; i++) {
  //   this.newOperation_cmd(`o${i+1}`, 10*60);
  //   sleep(1);
  // }
  // sleep(2);
  // this.operationList_cmd();
  // for (let i = 0; i < 10; i++) {
  //   this.newTicketRange_cmd(`${i+1}`);
  //   sleep(1);
  // }
  // sleep(2);
  // this.ticketRangeList();
  // sleep(3);
  // for (let i = 0; i < 10; i++) {
  //   this.newService_cmd(`s${i+1}`, `${i+2}`, {1: [`${i+1}`]});
  //   sleep(1);
  // }
  // for (let i = 1; i < 10; i++) {
  //   this.newWorkplace_cmd(`${i+1}`);
  //   sleep(1);
  // }
  // this.setUserRoleAllOperations_cmd();
  for (let i = 0; i < 10; i++) {
    this.newUser_cmd(`${i+1}`);
    sleep(1);
  }
  this.stop();
}