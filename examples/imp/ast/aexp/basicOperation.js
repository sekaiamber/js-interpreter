/**
 * 基础运算语法
 */

import { AExp } from '../base';

export default class BasicOperationAExp extends AExp {
  constructor(operator, left, right) {
    super();
    this.operator = operator;
    this.left = left;
    this.right = right;
  }

  eval(env) {
    const left = this.left.eval(env);
    const right = this.right.eval(env);
    let value;
    switch (this.operator) {
      case '+':
        value = left + right;
        break;
      case '-':
        value = left + right;
        break;
      case '*':
        value = left * right;
        break;
      case '/':
        value = left / right;
        break;
      default:
        throw new Error(`unknown operator: ${this.operator}`);
    }
    return value;
  }

  toString() {
    return `BasicOperationAExp(${this.operator}, ${this.left}, ${this.right})`;
  }
}
