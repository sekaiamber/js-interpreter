/* eslint import/no-extraneous-dependencies: 0 */
import { expect } from 'chai';
import Lexer from '../../src/lexer';
import {
  number,
  id,
  keyword,
  aexp,
} from './../../examples/imp/parser';
import {
  NumberAExp,
  IdAExp,
} from './../../examples/imp/ast';
import precedence from './../../examples/imp/parser/precedence';
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

  it('test precedence', (done) => {
    function combine(op) {
      if (op === '*') {
        return (l, r) => parseInt(l, 10) * parseInt(r, 10);
      }
      return (l, r) => parseInt(l, 10) + parseInt(r, 10);
    }
    const parser = precedence(number, [['*'], ['+']], combine);
    const tokens1 = lexer.lex('2 * 3 + 4');
    const result1 = parser.parse(tokens1, 0);
    const tokens2 = lexer.lex('2 + 3 * 4');
    const result2 = parser.parse(tokens2, 0);
    expect(result1.value).to.equal(10);
    expect(result2.value).to.equal(14);
    done();
  });

  it('number aexp', (done) => {
    const parser = aexp();
    const tokens = lexer.lex('6');
    const result = parser.parse(tokens, 0);
    expect(result.value.valueOf()).to.equal(new NumberAExp(6).valueOf());
    done();
  });

  it('id aexp', (done) => {
    const parser = aexp();
    const tokens = lexer.lex('a');
    const result = parser.parse(tokens, 0);
    expect(result.value.valueOf()).to.equal(new IdAExp('a').valueOf());
    done();
  });

  it('group aexp', (done) => {
    const parser = aexp();
    const tokens = lexer.lex('(6)');
    const result = parser.parse(tokens, 0);
    expect(result.value.valueOf()).to.equal(new NumberAExp(6).valueOf());
    done();
  });
});
