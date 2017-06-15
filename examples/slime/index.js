import Lexer from '../../src/lexer';
import tokenExprs from './tokenExprs';
import SlimeParser from './parser';

/**
 * slime分词器
 */

class SlimeLexer extends Lexer {
  constructor() {
    super();
    this._addTokenExpression = this.addTokenExpression;
    this.addTokenExpression = undefined;
    for (let i = 0; i < tokenExprs.length; i += 1) {
      const tokenExpr = tokenExprs[i];
      this._addTokenExpression(tokenExpr[0], tokenExpr[1]);
    }
  }
}

/**
 * slime解释器
 */

class Slime {
  constructor() {
    this.lexer = new SlimeLexer();
    this.parse = SlimeParser;
  }

  eval(code, env = {}) {
    // 词法分析
    const tokens = this.lexer.lex(code);
    // 语法分析
    const parseResult = this.parse(tokens);
    const ast = parseResult.value;
    // TODO: 语义分析
    // 执行
    const result = ast.eval(env);
    return {
      _tokens: tokens,
      result,
      env,
    };
  }
}

export default Slime;
export {
  SlimeLexer,
  SlimeParser,
};
