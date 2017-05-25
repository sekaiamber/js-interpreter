/**
 * 复合语句语法
 */

import { Stmt } from '../base';

export default class CompoundStmt extends Stmt {
  constructor(first, second) {
    super();
    this.first = first;
    this.second = second;
  }

  eval(env) {
    this.first.eval(env);
    const result = this.second.eval(env);
    return result;
  }

  toString() {
    return `CompoundStmt(${this.first}, ${this.second})`;
  }
}
