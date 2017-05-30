/* eslint import/no-extraneous-dependencies: 0 */
import { expect } from 'chai';
import Lexer from '../../src/lexer';
import {
  number,
  id,
  keyword,
  aexp,
  bexp,
  stmt,
  stmtList,
} from './../../examples/imp/parser';
import {
  NumberAExp,
  IdAExp,
  BasicOperationAExp,
  RelationalOperationBExp,
  NotBExp,
  AndBExp,
  OrBExp,
  AssignStmt,
  IfStmt,
  WhileStmt,
  CompoundStmt,
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

  it('basic operation aexp', (done) => {
    const parser = aexp();
    const tokens = lexer.lex('2 + 3 * 4');
    const result = parser.parse(tokens, 0);
    const expectResult = new BasicOperationAExp('+', new NumberAExp(2), new BasicOperationAExp('*', new NumberAExp(3), new NumberAExp(4)));
    expect(result.value.valueOf()).to.equal(expectResult.valueOf());
    done();
  });

  it('basic operation group aexp', (done) => {
    const parser = aexp();
    const tokens = lexer.lex('(2 + 3) * 4');
    const result = parser.parse(tokens, 0);
    const expectResult = new BasicOperationAExp('*', new BasicOperationAExp('+', new NumberAExp(2), new NumberAExp(3)), new NumberAExp(4));
    expect(result.value.valueOf()).to.equal(expectResult.valueOf());
    done();
  });

  it('relational operation bexp', (done) => {
    const parser = bexp();
    const tokens = lexer.lex('1 < 2');
    const result = parser.parse(tokens, 0);
    const expectResult = new RelationalOperationBExp('<', new NumberAExp(1), new NumberAExp(2));
    expect(result.value.valueOf()).to.equal(expectResult.valueOf());
    done();
  });

  it('not bexp', (done) => {
    const parser = bexp();
    const tokens = lexer.lex('not 1 < 2');
    const result = parser.parse(tokens, 0);
    const expectResult = new NotBExp(new RelationalOperationBExp('<', new NumberAExp(1), new NumberAExp(2)));
    expect(result.value.valueOf()).to.equal(expectResult.valueOf());
    done();
  });

  it('and bexp', (done) => {
    const parser = bexp();
    const tokens = lexer.lex('1 < 2 and 2 > 3');
    const result = parser.parse(tokens, 0);
    const expectResult = new AndBExp(new RelationalOperationBExp('<', new NumberAExp(1), new NumberAExp(2)), new RelationalOperationBExp('>', new NumberAExp(2), new NumberAExp(3)));
    expect(result.value.valueOf()).to.equal(expectResult.valueOf());
    done();
  });

  it('or bexp', (done) => {
    const parser = bexp();
    const tokens = lexer.lex('1 < 2 or 2 > 3');
    const result = parser.parse(tokens, 0);
    const expectResult = new OrBExp(new RelationalOperationBExp('<', new NumberAExp(1), new NumberAExp(2)), new RelationalOperationBExp('>', new NumberAExp(2), new NumberAExp(3)));
    expect(result.value.valueOf()).to.equal(expectResult.valueOf());
    done();
  });

  it('logic bexp', (done) => {
    const parser = bexp();
    const tokens = lexer.lex('1 < 2 and 3 < 4 or 5 < 6');
    const result = parser.parse(tokens, 0);
    const expectResult = new OrBExp(
      new AndBExp(
        new RelationalOperationBExp('<', new NumberAExp(1), new NumberAExp(2)),
        new RelationalOperationBExp('<', new NumberAExp(3), new NumberAExp(4)),
      ),
      new RelationalOperationBExp('<', new NumberAExp(5), new NumberAExp(6))
    );
    expect(result.value.valueOf()).to.equal(expectResult.valueOf());
    done();
  });

  it('logic group bexp', (done) => {
    const parser = bexp();
    const tokens = lexer.lex('1 < 2 and (3 < 4 or 5 < 6)');
    const result = parser.parse(tokens, 0);
    const expectResult = new AndBExp(
      new RelationalOperationBExp('<', new NumberAExp(1), new NumberAExp(2)),
      new OrBExp(
        new RelationalOperationBExp('<', new NumberAExp(3), new NumberAExp(4)),
        new RelationalOperationBExp('<', new NumberAExp(5), new NumberAExp(6)),
      )
    );
    expect(result.value.valueOf()).to.equal(expectResult.valueOf());
    done();
  });

  it('assign statement', (done) => {
    const parser = stmt();
    const tokens = lexer.lex('a := 1');
    const result = parser.parse(tokens, 0);
    const expectResult = new AssignStmt('a', new NumberAExp(1));
    expect(result.value.valueOf()).to.equal(expectResult.valueOf());
    done();
  });

  it('if statement', (done) => {
    const parser = stmt();
    const tokens = lexer.lex('if 1 < 2 then a := 3 else a := 4 end');
    const result = parser.parse(tokens, 0);
    const expectResult = new IfStmt(
      new RelationalOperationBExp('<', new NumberAExp(1), new NumberAExp(2)),
      new AssignStmt('a', new NumberAExp(3)),
      new AssignStmt('a', new NumberAExp(4)),
    );
    expect(result.value.valueOf()).to.equal(expectResult.valueOf());
    done();
  });

  it('while statement', (done) => {
    const parser = stmt();
    const tokens = lexer.lex('while 1 < 2 do a := 3 end');
    const result = parser.parse(tokens, 0);
    const expectResult = new WhileStmt(
      new RelationalOperationBExp('<', new NumberAExp(1), new NumberAExp(2)),
      new AssignStmt('a', new NumberAExp(3))
    );
    expect(result.value.valueOf()).to.equal(expectResult.valueOf());
    done();
  });

  it('compound statement', (done) => {
    const parser = stmtList();
    const tokens = lexer.lex('a := 1; b := 2');
    const result = parser.parse(tokens, 0);
    const expectResult = new CompoundStmt(
      new AssignStmt('a', new NumberAExp(1)),
      new AssignStmt('b', new NumberAExp(2)),
    );
    expect(result.value.valueOf()).to.equal(expectResult.valueOf());
    done();
  });
});
