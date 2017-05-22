import Token from './token';

export default class Lexer {
  constructor() {
    this.tokenExprs = [];
  }
  addTokenExpression(pattern, tag) {
    this.tokenExprs.push({ pattern, tag });
  }
  lex(characters) {
    let pos = 0;
    const tokens = [];
    while (pos < characters.length) {
      let match = null;
      let matchText = null;
      const subCharacters = characters.substr(pos);
      for (let i = 0; i < this.tokenExprs.length; i += 1) {
        const { pattern, tag } = this.tokenExprs[i];
        match = subCharacters.match(pattern);
        if (match) {
          matchText = match[0];
          if (tag) {
            const token = new Token(matchText, tag);
            tokens.push(token);
          }
          break;
        }
      }
      if (!match) {
        throw new Error(`Illegal character: ${subCharacters[0]}`);
      }
      pos += matchText.length;
    }
    return tokens;
  }
}
