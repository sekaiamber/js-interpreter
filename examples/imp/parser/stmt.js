/**
 * 这里是一些IMP的语句类(Stmt)的解析器
 */

import {
  AssignStmt,
  IfStmt,
  CompoundStmt,
  WhileStmt,
} from '../ast';
import {
  id,
  keyword,
} from './basic';
import { LazyParser, OptionParser, ExpressionParser } from '../../../src/combinators';
import aexp from './aexp';
import bexp from './bexp';

function _processAssign(parsed) {
  // [[name, _], exp]
  return new AssignStmt(parsed[0][0], parsed[1]);
}

function _processIf(parsed) {
  // [[[[[_, condition], _], true_stmt], false_parsed], _]
  const condition = parsed[0][0][0][0][1];
  const trueStmt = parsed[0][0][1];
  let falseStmt = parsed[0][1];
  if (falseStmt) {
    falseStmt = falseStmt[1];
  }
  return new IfStmt(condition, trueStmt, falseStmt);
}

function _processWhile(parsed) {
  // [[[[_, condition], _], body], _]
  return new WhileStmt(parsed[0][0][0][1], parsed[0][1]);
}

const _temp = {
  stmt: null,
};

/**
 * 语句列表
 */

function stmtList() {
  const separator = keyword(';').do(() => (l, r) => new CompoundStmt(l, r));
  return new ExpressionParser(_temp.stmt(), separator);
}

/**
 * 赋值语句
 */

function stmtAssign() {
  return id.concat(keyword(':=')).concat(aexp()).do(_processAssign);
}

/**
 * 判断语句
 */

function stmtIf() {
  return (
    keyword('if')
    .concat(bexp())
    .concat(keyword('then'))
    .concat(new LazyParser(stmtList))
    .concat(new OptionParser(
      keyword('else')
      .concat(new LazyParser(stmtList))
    ))
    .concat(keyword('end'))
    .do(_processIf)
  );
}

/**
 * 循环语句
 */

function stmtWhile() {
  return (
    keyword('while')
    .concat(bexp())
    .concat(keyword('do'))
    .concat(new LazyParser(stmtList))
    .concat(keyword('end'))
    .do(_processWhile)
  );
}

/**
 * stmt解析器
 */

function stmt() {
  return stmtAssign().or(stmtIf()).or(stmtWhile());
}

_temp.stmt = stmt;

export default stmt;
export {
  stmtAssign,
  stmtIf,
  stmtList,
  stmtWhile,
};
