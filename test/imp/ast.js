/* eslint import/no-extraneous-dependencies: 0 */
import { expect } from 'chai';
import {
  NumberAExp,
  IdAExp,
  BasicOperationAExp,
  RelationalOperationBExp,
  AndBExp,
  OrBExp,
  NotBExp,
} from './../../examples/imp/ast';

describe('AST test', () => {
  it('number AExp', (done) => {
    let n = new NumberAExp(1);
    expect(n.toString()).to.equal('NumberAExp(1)');
    n = n.eval();
    expect(n).to.equal(1);
    done();
  });

  it('Id AExp', (done) => {
    let n = new IdAExp('test');
    const env = {
      test: 100,
    };
    expect(n.toString()).to.equal('IdAExp(test)');
    n = n.eval(env);
    expect(n).to.equal(100);
    done();
  });

  it('basic operation AExp', (done) => {
    const left = new NumberAExp(1);
    const right = new IdAExp('right');
    const env = {
      right: 2,
    };
    const opt = new BasicOperationAExp('+', left, right);
    expect(opt.toString()).to.equal('BasicOperationAExp(+, NumberAExp(1), IdAExp(right))');
    const result = opt.eval(env);
    expect(result).to.equal(3);
    done();
  });

  it('relational operation BExp', (done) => {
    const left = new NumberAExp(1);
    const right = new IdAExp('right');
    const env = {
      right: 2,
    };
    const opt = new RelationalOperationBExp('>', left, right);
    expect(opt.toString()).to.equal('RelationalOperationBExp(>, NumberAExp(1), IdAExp(right))');
    const result = opt.eval(env);
    expect(result).to.equal(false);
    done();
  });

  it('and BExp', (done) => {
    const left1 = new NumberAExp(2);
    const right1 = new NumberAExp(1);
    const opt1 = new RelationalOperationBExp('>', left1, right1);
    const left2 = new NumberAExp(1);
    const right2 = new NumberAExp(2);
    const opt2 = new RelationalOperationBExp('<', left2, right2);
    const and = new AndBExp(opt1, opt2);
    const result = and.eval();
    expect(result).to.equal(true);
    done();
  });

  it('or BExp', (done) => {
    const left1 = new NumberAExp(2);
    const right1 = new NumberAExp(1);
    const opt1 = new RelationalOperationBExp('>', left1, right1);
    const left2 = new NumberAExp(1);
    const right2 = new NumberAExp(2);
    const opt2 = new RelationalOperationBExp('>', left2, right2);
    const or = new OrBExp(opt1, opt2);
    const result = or.eval();
    expect(result).to.equal(true);
    done();
  });

  it('not BExp', (done) => {
    const left = new NumberAExp(2);
    const right = new NumberAExp(1);
    const opt = new RelationalOperationBExp('>', left, right);
    const not = new NotBExp(opt);
    const result = not.eval();
    expect(result).to.equal(false);
    done();
  });
});
