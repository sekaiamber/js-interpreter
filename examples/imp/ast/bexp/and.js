/**
 * 与运算语法
 */

import { BExp } from '../base';

export default class AndBExp extends BExp {
  constructor(left, right) {
    super();
    this.left = left;
    this.right = right;
  }

  eval(env) {
    const left = this.left.eval(env);
    const right = this.left.eval(env);
    return left && right;
  }

  toString() {
    return `AndBexp(${this.left}, ${this.right})`;
  }
}
