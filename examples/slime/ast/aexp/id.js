/**
 * 变量语法
 */


import { AExp } from '../base';

export default class IdAExp extends AExp {
  constructor(name) {
    super();
    this.name = name;
  }

  eval(env) {
    return env[this.name];
  }

  toString() {
    return `IdAExp(${this.name})`;
  }
}
