/* eslint import/no-extraneous-dependencies: 0 */
import { expect } from 'chai';
import Slime, {
  SlimeLexer,
} from './../../examples/slime';

const code = `n = 5;
p = 1;
while n > 0 do
  p = p * n;
  n = n - 1;
end`;

describe('Slime test', () => {
  it('lexer test', (done) => {
    const lexer = new SlimeLexer();
    const tokens = lexer.lex('a = 1');
    expect(tokens.length).to.equal(3);
    done();
  });

  it('slime', (done) => {
    const slime = new Slime();
    const result = slime.eval('a = 1');
    expect(result.result).to.equal(1);
    expect(result.env.a).to.equal(1);
    done();
  });

  it('slime', (done) => {
    const slime = new Slime();
    const result = slime.eval(code);
    const env = result.env;
    expect(env.n).to.equal(0);
    expect(env.p).to.equal(120);
    done();
  });
});
