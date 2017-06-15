/**
 * 数字型语法
 */

import { AExp } from '../base';

export default class NumberAExp extends AExp {
  constructor(n) {
    super();
    this.number = n;
  }

  eval() {
    return this.number;
  }

  toString() {
    return `NumberAExp(${this.number})`;
  }
}
