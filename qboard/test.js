import { incrementTimeout } from "../common.js";

export function test() {
  this.socket.setTimeout(this.subscribeUsers_cmd.bind(this), incrementTimeout(250, 750));
  this.socket.setTimeout(this.userList_cmd.bind(this), incrementTimeout(250, 750));
  this.socket.setTimeout(() => {
    this.subscribeCurrentQueue2_cmd({servingOnly:true, size: 0})
  }, incrementTimeout(250, 750));
  this.socket.setTimeout(() => {
    this.currentQueue2_cmd({servingOnly:true, size: 0})
  }, incrementTimeout(250, 750));
}