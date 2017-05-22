import tokenExprs, { NONE, RESERVED, NUMBER, ID } from './tokenExprs';

const tinyExpr = 'a := 1 + 1';
const errorExpr = 'a & 1';

export {
  tokenExprs,
  tinyExpr,
  errorExpr,
  NONE,
  RESERVED,
  NUMBER,
  ID,
};
