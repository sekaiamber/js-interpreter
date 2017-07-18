import Lexer from '../../src/lexer';
import tokenExprs from './tokenExprs';
import slimeParser from './parser';

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

const SlimeParser = slimeParser();
/**
 * slime解释器
 */

class Slime {
  constructor() {
    this.lexer = new SlimeLexer();
    this.parser = SlimeParser;
  }

  eval(code, env = {}) {
    // 词法分析
    const tokens = this.lexer.lex(code);
    // 语法分析
    const parseResult = this.parser.parse(tokens, 0);
    if (!parseResult) {
      throw new Error('Parse error!');
    }
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
