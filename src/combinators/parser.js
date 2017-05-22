import Result from './result';

const baseCombinators = {
  concat: null,
  or: null,
  do: null,
};

/**
 * 分析器基类
 */

class Parser {
  concat(other) {
    return new baseCombinators.concat(this, other);
  }
  or(other) {
    return new baseCombinators.or(this, other);
  }
  do(handler) {
    return new baseCombinators.do(this, handler);
  }
  parse() {
    throw new Error('Cannot use base class Parser');
  }
}

/**
 * 基础分析器-连接
 * 这个分析器将接一个左分析器和一个右分析器，他先执行左分析器，再执行右分析器
 */

class ConcatParser extends Parser {
  constructor(left, right) {
    super();
    this.left = left;
    this.right = right;
  }

  parse(tokens, pos) {
    const leftResult = this.left.parse(tokens, pos);
    if (leftResult) {
      const rightResult = this.right.parse(tokens, leftResult.pos);
      if (rightResult) {
        return new Result([leftResult.value, rightResult.value], rightResult.pos);
      }
    }
    return null;
  }
}

/**
 * 基础分析器-或
 * 这个分析器先执行左分析器，如果有值，则返回，否则返回右分析器结果
 */

class AlternateParser extends Parser {
  constructor(left, right) {
    super();
    this.left = left;
    this.right = right;
  }

  parse(tokens, pos) {
    const leftResult = this.left.parse(tokens, pos);
    if (leftResult) return leftResult;
    const rightResult = this.right.parse(tokens, pos);
    return rightResult;
  }
}

/**
 * 基础分析器-处理
 * 这个分析器将接收一个分析器和一个处理函数，这个函数将处理Result.value并且返回真正的值。
 * 这个分析器是执行代码的核心。
 */

class ProcessParser extends Parser {
  constructor(parser, handler) {
    super();
    this.parser = parser;
    this.handler = handler;
  }

  parse(tokens, pos) {
    const result = this.parser.parse(tokens, pos);
    if (result) {
      return this.handler(result.value);
    }
    return null;
  }
}

baseCombinators.concat = ConcatParser;
baseCombinators.or = AlternateParser;
baseCombinators.do = ProcessParser;

export default Parser;
export {
  ConcatParser,
  AlternateParser,
  ProcessParser,
};
