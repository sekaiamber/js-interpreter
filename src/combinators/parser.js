import Result from './result';

const baseCombinators = {
  concat: null,
};

/**
 * 分析器基类
 */

class Parser {
  concat(other) {
    return new baseCombinators.concat(this, other);
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
    console.log(leftResult);
    if (leftResult) {
      const rightResult = this.right.parse(tokens, leftResult.pos);
      console.log(rightResult);
      if (rightResult) {
        return new Result([leftResult.value, rightResult.value], rightResult.pos);
      }
    }
    return null;
  }
}

baseCombinators.concat = ConcatParser;

export default Parser;
export {
  ConcatParser,
};
