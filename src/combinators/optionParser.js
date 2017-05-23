/**
 * 可选解析器
 * 这个解析器接受一个解析器，分析时如果这个解析器有值，则返回，否则返回一个占位的result返回原来的pos。
 * 这个解析器通常运用在某些可选语法中，比如`if else`，这个`else`可能是不存在的。
 */

import Parser from './parser';
import Result from './result';

export default class OptionParser extends Parser {
  constructor(parser) {
    super();
    this.parser = parser;
  }

  parse(tokens, pos) {
    const result = this.parser.parse(tokens, pos);
    if (result) return result;
    return new Result(null, pos);
  }
}
