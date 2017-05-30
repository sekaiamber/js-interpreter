/* eslint import/no-extraneous-dependencies: 0 */
import { expect } from 'chai';
import IMP, {
  ImpLexer,
} from './../../examples/imp';

describe('IMP test', () => {
  it('lexer test', (done) => {
    const lexer = new ImpLexer();
    const tokens = lexer.lex('a := 1');
    expect(tokens.length).to.equal(3);
    done();
  });

  it('imp', (done) => {
    const imp = new IMP();
    const result = imp.eval('a := 1');
    expect(result.result).to.equal(1);
    expect(result.env.a).to.equal(1);
    done();
  });
});
