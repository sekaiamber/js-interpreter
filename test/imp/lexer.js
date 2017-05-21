/* eslint import/no-extraneous-dependencies: 0 */
import { expect } from 'chai';
import Lexer from '../../src/lexer';
import { tokenExprs, tinyExpr, errorExpr } from './fixtures';

describe('Lexer test', () => {
  it('add token expressions', (done) => {
    const lexer = new Lexer();
    for (let i = 0; i < tokenExprs.length; i += 1) {
      const tokenExpr = tokenExprs[i];
      lexer.addTokenExpression(tokenExpr[0], tokenExpr[1]);
    }
    expect(lexer.tokenExprs.length).to.equal(tokenExprs.length);
    done();
  });

  it('test tiny expressions', (done) => {
    const lexer = new Lexer();
    for (let i = 0; i < tokenExprs.length; i += 1) {
      const tokenExpr = tokenExprs[i];
      lexer.addTokenExpression(tokenExpr[0], tokenExpr[1]);
    }
    lexer.lex(tinyExpr);
    done();
  });

  it('test error expressions', (done) => {
    const lexer = new Lexer();
    for (let i = 0; i < tokenExprs.length; i += 1) {
      const tokenExpr = tokenExprs[i];
      lexer.addTokenExpression(tokenExpr[0], tokenExpr[1]);
    }
    try {
      lexer.lex(errorExpr);
    } catch (error) {
      done();
    }
  });
});
