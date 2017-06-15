/**
 * 赋值语法
 */

import { Stmt } from '../base';

export default class AssignStmt extends Stmt {
  constructor(name, aexp) {
    super();
    this.name = name;
    this.aexp = aexp;
  }

  eval(env) {
    const value = this.aexp.eval(env);
    env[this.name] = value;
    return value;
  }

  toString() {
    return `AssignStmt(${this.name}, ${this.aexp})`;
  }
}
