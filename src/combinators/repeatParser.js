/**
 * 重复解析器
 * 这个解析器接受一个解析器，解析时将不停得消耗Token，直到失败为止，返回之前的所有Results
 */

import Parser from './parser';
import Result from './result';

export default class RepeatParser extends Parser {
  constructor(parser) {
    super();
    this.parser = parser;
  }

  parse(tokens, pos) {
    const results = [];
    let resultPos = pos;
    let result = this.parser.parse(tokens, pos);
    while (result) {
      results.push(result.value);
      resultPos = result.pos;
      result = this.parser.parse(tokens, resultPos);
    }
    return new Result(results, pos);
  }
}
