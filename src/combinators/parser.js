import Result from './result';

const baseCombinators = {
  concat: null,
  or: null,
  do: null,
  join: null,
};

/**
 * 解析器基类
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
  join(other) {
    return new baseCombinators.join(this, other);
  }
  parse() {
    throw new Error('Cannot use base class Parser');
  }
}

/**
 * 基础解析器-连接
 * 这个解析器将接一个左解析器和一个右解析器，他先执行左解析器，再执行右解析器
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
 * 基础解析器-或
 * 这个解析器先执行左解析器，如果有值，则返回，否则返回右解析器结果
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
 * 基础解析器-处理
 * 这个解析器将接收一个解析器和一个处理函数，这个函数将处理Result.value并且返回真正的值。
 * 这个解析器是执行代码的核心。
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
      result.value = this.handler(result.value);
      return result;
    }
    return null;
  }
}

/**
 * 表达式解析器
 * 这个解析器主要是为了解决复合语句问题，复合语句在形成解析器的时候会产生左递归，这里使用这个解析器来解决问题。
 */

class ExpressionParser extends Parser {
  constructor(parser, separator) {
    super();
    this.parser = parser;
    this.separator = separator;
  }

  parse(tokens, pos) {
    let result = this.parser.parse(tokens, pos);
    const nextFactory = (parsed) => {
      const sepfunc = parsed[0];
      const right = parsed[1];
      return sepfunc(result.value, right);
    };
    const nextParser = this.separator.concat(this.parser).do(nextFactory);
    let nextResult = result;
    while (nextResult) {
      nextResult = nextParser.parse(tokens, result.pos);
      if (nextResult) {
        result = nextResult;
      }
    }
    return result;
  }
}

baseCombinators.concat = ConcatParser;
baseCombinators.or = AlternateParser;
baseCombinators.do = ProcessParser;
baseCombinators.join = ExpressionParser;

export default Parser;
export {
  ConcatParser,
  AlternateParser,
  ProcessParser,
  ExpressionParser,
};
