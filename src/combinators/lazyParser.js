/**
 * 惰性解析器
 * 这个解析器接受一个解析器生成函数，只有当调用到的时候，才会去生成解析器。
 */

import Parser from './parser';

export default class LazyParser extends Parser {
  constructor(parserFactory) {
    super();
    this.parser = null;
    this.parserFactory = parserFactory;
  }

  parse(tokens, pos) {
    if (!this.parser) {
      this.parser = this.parserFactory();
    }
    return this.parser.parse(tokens, pos);
  }
}
