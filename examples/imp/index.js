import Lexer from '../../src/lexer';
import tokenExprs from './tokenExprs';
import impParser from './parser';

/**
 * imp分词器
 */

class ImpLexer extends Lexer {
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
 * imp解释器
 */

class IMP {
  constructor() {
    this.lexer = new ImpLexer();
    this.parse = impParser;
  }

  eval(code, env = {}) {
    const tokens = this.lexer.lex(code);
    const parseResult = this.parse(tokens);
    const ast = parseResult.value;
    const result = ast.eval(env);
    return {
      _tokens: tokens,
      result,
      env,
    };
  }
}

export default IMP;
export {
  ImpLexer,
  impParser,
};
