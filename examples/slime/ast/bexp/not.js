/**
 * 非运算语法
 */

import { BExp } from '../base';

export default class NotBExp extends BExp {
  constructor(exp) {
    super();
    this.exp = exp;
  }

  eval(env) {
    const exp = this.exp.eval(env);
    return !exp;
  }

  toString() {
    return `NotBexp(${this.exp})`;
  }
}
