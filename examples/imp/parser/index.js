import {
  keyword,
  number,
  id,
} from './basic';
import aexp, {
  aexpValue,
  aexpGroup,
  aexpTerm,
} from './aexp';
import bexp, {
  bexpRelationalOperation,
  bexpGroup,
  bexpNot,
} from './bexp';
import stmt, {
  stmtAssign,
  stmtIf,
  stmtList,
  stmtWhile,
} from './stmt';
import { PhraseParser } from '../../../src/combinators';

/**
 * 语句组合解析器，这个解析器要求代码完整性，作为程序的入口
 */

function impPhrase() {
  return new PhraseParser(stmtList());
}

/**
 * IMP程序解析器
 */
function impParser(tokens) {
  return impPhrase().parse(tokens, 0);
}

export default impParser;
export {
  keyword,
  number,
  id,
  aexp,
  aexpValue,
  aexpGroup,
  aexpTerm,
  bexp,
  bexpRelationalOperation,
  bexpGroup,
  bexpNot,
  stmt,
  stmtAssign,
  stmtIf,
  stmtList,
  stmtWhile,
  impPhrase,
};
