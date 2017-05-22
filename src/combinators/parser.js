import Result from './result';

const baseCombinators = {
  concat: null,
  or: null,
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

baseCombinators.concat = ConcatParser;
baseCombinators.or = AlternateParser;

export default Parser;
export {
  ConcatParser,
  AlternateParser,
};
