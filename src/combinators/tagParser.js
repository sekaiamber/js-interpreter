/**
 * 标记解析器
 * 这个解析器跟Reserved解析器很相似，只不过他只要求token是指定tag即可。
 */

import Parser from './parser';
import Result from './result';

export default class TagParser extends Parser {
  constructor(tag) {
    super();
    this.tag = tag;
  }

  parse(tokens, pos) {
    if (pos < tokens.length) {
      const token = tokens[pos];
      if (token.tag === this.tag) {
        return new Result(token.value, pos + 1);
      }
    }
    return null;
  }
}
