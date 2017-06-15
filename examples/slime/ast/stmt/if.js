/**
 * 判断语句语法
 */

import { Stmt } from '../base';

export default class IfStmt extends Stmt {
  constructor(condition, trueStmt, falseStmt) {
    super();
    this.condition = condition;
    this.trueStmt = trueStmt;
    this.falseStmt = falseStmt;
  }

  eval(env) {
    const value = this.condition.eval(env);
    if (value) {
      return this.trueStmt.eval(env);
    }
    if (this.falseStmt) {
      return this.falseStmt.eval(env);
    }
    return undefined;
  }

  toString() {
    return `IfStmt(${this.condition}, ${this.trueStmt}, ${this.falseStmt})`;
  }
}
