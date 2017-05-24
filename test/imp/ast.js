/* eslint import/no-extraneous-dependencies: 0 */
import { expect } from 'chai';
import {
  NumberAExp,
  IdAExp,
  BasicOperationAExp,
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
});
