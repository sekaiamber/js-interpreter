/**
 * 代码完整性解析器
 * 这个解析器接受一个解析器，行为跟这个解析器完全一样，只不过它在这个解析器分析完毕之后，token必须消耗完，否则就返回null。
 */

import Parser from './parser';

export default class PhraseParser extends Parser {
  constructor(parser) {
    super();
    this.parser = parser;
  }

  parse(tokens, pos) {
    const result = this.parser.parse(tokens, pos);
    if (result && result.pos === tokens.length) return result;
    return null;
  }
}
