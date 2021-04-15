import { Socket } from "../socket/Socket.js";
import { check } from 'k6';

export class Login extends Socket {
  constructor(options, metrics) {
    super(metrics);
    this.component = options.component;
    this.components = options.components;
    this.isAuth = true;
  }
  socket_connected () {
    super.socket_connected();
    this.login_cmd();
  }
  login_cmd() {
    this.send2socket('login', {
      component: this.component.name,
      login: this.component.login,
      password: this.component.password,
      workplace: this.component.workplace
    });
  }
  login_hdl(response) {
    check(response, {
      'login response has token': (r) => r && r.command === "login" && r.token.length === 38,
    });
    this.component.token = response.token;
    this.components[this.component.vu] = this.component;
    this.stop();
  }
}

export class Logout extends Socket {
  constructor(options, metrics) {
    super(metrics);
    this.token = options.token;
    this.workplace = options.workplace;
    this.isAuth = true;
  }
  socket_connected() {
    this.logout_cmd();
  }
  logout_cmd() {
    this.send2socket('logout', {workplace: +this.workplace});
  }
  logout_hdl() {
    this.stop();
  }
}