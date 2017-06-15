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

function slimePhrase() {
  return new PhraseParser(stmtList());
}

/**
 * Slime程序解析器
 */
function SlimeParser(tokens) {
  return slimePhrase().parse(tokens, 0);
}

export default SlimeParser;
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
  slimePhrase,
};
