/**
 * 关键字解析器
 * 这个解析器将接收指定tag指定值的token。
 */

import Parser from './parser';
import Result from './result';

export default class ReservedParser extends Parser {
  constructor(value, tag) {
    super();
    this.value = value;
    this.tag = tag;
  }

  parse(tokens, pos) {
    if (pos < tokens.length) {
      const token = tokens[pos];
      if (token.value === this.value && token.tag === this.tag) {
        return new Result(token.value, pos + 1);
      }
    }
    return null;
  }
}
