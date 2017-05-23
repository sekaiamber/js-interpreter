/* eslint import/no-extraneous-dependencies: 0 */
import { expect } from 'chai';
import Lexer from '../../src/lexer';
import {
  ReservedParser,
  TagParser,
  OptionParser,
  RepeatParser,
  LazyParser,
  PhraseParser,
  ExpressionParser,
} from '../../src/combinators';
import { tokenExprs, RESERVED, NUMBER, ID } from './fixtures';


const lexer = new Lexer();
for (let i = 0; i < tokenExprs.length; i += 1) {
  const tokenExpr = tokenExprs[i];
  lexer.addTokenExpression(tokenExpr[0], tokenExpr[1]);
}

describe('Combinators test', () => {
  // it('test reserved parser', (done) => {
  //   const tokens = lexer.lex('when');
  //   const parser = new ReservedParser('when', RESERVED);
  //   const result = parser.parse(tokens, 0);
  //   expect(result.value).to.equal('when');
  //   expect(result.pos).to.equal(1);
  //   done();
  // });

  // it('test tag parser', (done) => {
  //   const tokens = lexer.lex(':=');
  //   const parser = new TagParser(RESERVED);
  //   const result = parser.parse(tokens, 0);
  //   expect(result.value).to.equal(':=');
  //   expect(result.pos).to.equal(1);
  //   done();
  // });

  // it('test concat parser', (done) => {
  //   const tokens = lexer.lex('1 + 1');
  //   const parser = new TagParser(NUMBER).concat(new ReservedParser('+', RESERVED)).concat(new TagParser(NUMBER));
  //   const result = parser.parse(tokens, 0);
  //   expect(result.value.length).to.equal(2);
  //   expect(result.value[0].length).to.equal(2);
  //   expect(result.pos).to.equal(3);
  //   done();
  // });

  // it('test alternate parser', (done) => {
  //   const tokens = lexer.lex('*');
  //   const parser = new ReservedParser('+', RESERVED).or(new ReservedParser('-', RESERVED)).or(new ReservedParser('*', RESERVED)).or(new ReservedParser('/', RESERVED));
  //   const result = parser.parse(tokens, 0);
  //   expect(result.value).to.equal('*');
  //   expect(result.pos).to.equal(1);
  //   done();
  // });

  // it('test option parser', (done) => {
  //   const tokens1 = lexer.lex('if a else b');
  //   const tokens2 = lexer.lex('if a');
  //   const parser = new ReservedParser('if', RESERVED).concat(new TagParser(ID)).concat(new OptionParser(new ReservedParser('else', RESERVED).concat(new TagParser(ID))));
  //   const result1 = parser.parse(tokens1, 0);
  //   const result2 = parser.parse(tokens2, 0);
  //   expect(result1.pos).to.equal(tokens1.length);
  //   expect(result2.pos).to.equal(tokens2.length);
  //   done();
  // });

  // it('test repeat parser', (done) => {
  //   const token = lexer.lex('a b c');
  //   const parser = new RepeatParser(new TagParser(ID));
  //   const result = parser.parse(token, 0);
  //   expect(result.value.length).to.equal(3);
  //   expect(result.pos).to.equal(0);
  //   done();
  // });

  it('test process parser', (done) => {
    const token = lexer.lex('1 + 1');
    const handler = value => parseInt(value[0][0], 10) + parseInt(value[1], 10);
    const parser = new TagParser(NUMBER).concat(new ReservedParser('+', RESERVED)).concat(new TagParser(NUMBER)).do(handler);
    const result = parser.parse(token, 0);
    expect(result.value).to.equal(2);
    done();
  });

  // it('test lazy parser', (done) => {
  //   const token = lexer.lex('a');
  //   const parserFactory = () => new TagParser(ID);
  //   const parser = new LazyParser(parserFactory);
  //   const result = parser.parse(token, 0);
  //   expect(result.value).to.equal('a');
  //   done();
  // });

  // it('test phrase parser', (done) => {
  //   const token = lexer.lex('a');
  //   const parser = new PhraseParser(new TagParser(ID));
  //   const result = parser.parse(token, 0);
  //   expect(result.value).to.equal('a');
  //   done();
  // });

  // it('test expression parser', (done) => {
  //   const separator = new ReservedParser('+', RESERVED).do(() => (l, r) => l + r);
  //   const parser = new ExpressionParser(new TagParser(ID), separator);
  //   // const token1 = lexer.lex('a');
  //   // const result1 = parser.parse(token1, 0);
  //   const token2 = lexer.lex('a + b');
  //   const result2 = parser.parse(token2, 0);
  //   // const token3 = lexer.lex('a + b + c');
  //   // const result3 = parser.parse(token3, 0);
  //   // console.log(result1);
  //   console.log(result2);
  //   // console.log(result3);
  //   done();
  //   // separator = keyword('+') ^ (lambda x: lambda l, r: l + r)
  //   //     parser = Exp(id, separator)
  //   //     self.combinator_test('x', parser, 'x')
  //   //     self.combinator_test('x + y', parser, 'xy')
  //   //     self.combinator_test('x + y + z', parser, 'xyz')
  // });
});
