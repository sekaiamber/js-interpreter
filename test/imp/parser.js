/* eslint import/no-extraneous-dependencies: 0 */
import { expect } from 'chai';
import Lexer from '../../src/lexer';
import {
  number,
  id,
  keyword,
} from './../../examples/imp/parser';
import { tokenExprs } from './fixtures';

const lexer = new Lexer();
for (let i = 0; i < tokenExprs.length; i += 1) {
  const tokenExpr = tokenExprs[i];
  lexer.addTokenExpression(tokenExpr[0], tokenExpr[1]);
}

describe('IMP parser test', () => {
  it('keyword', (done) => {
    const tokens = lexer.lex('if');
    const parser = keyword('if');
    const result = parser.parse(tokens, 0);
    expect(result.value).to.equal('if');
    done();
  });

  it('number', (done) => {
    const tokens = lexer.lex('1');
    const result = number.parse(tokens, 0);
    expect(result.value).to.equal(1);
    done();
  });

  it('id', (done) => {
    const tokens = lexer.lex('a');
    const result = id.parse(tokens, 0);
    expect(result.value).to.equal('a');
    done();
  });
});
