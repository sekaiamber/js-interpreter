/**
 * 循环语句语法
 */

import { Stmt } from '../base';

export default class WhileStmt extends Stmt {
  constructor(condition, body) {
    super();
    this.condition = condition;
    this.body = body;
  }

  eval(env) {
    let value = this.condition.eval(env);
    let ret;
    while (value) {
      ret = this.body.eval(env);
      value = this.condition.eval(env);
    }
    return ret;
  }

  toString() {
    return `WhileStmt(${this.condition}, ${this.body})`;
  }
}
