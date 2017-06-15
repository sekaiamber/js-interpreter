/**
 * 或运算语法
 */

import { BExp } from '../base';

export default class OrBExp extends BExp {
  constructor(left, right) {
    super();
    this.left = left;
    this.right = right;
  }

  eval(env) {
    const left = this.left.eval(env);
    if (left) return true;
    const right = this.left.eval(env);
    return left || right;
  }

  toString() {
    return `OrBexp(${this.left}, ${this.right})`;
  }
}
