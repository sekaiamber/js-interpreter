/* eslint no-use-before-define: 0 */
/**
 * 这里是一系列Slime的算数表达式(AExp)解析器
 */

import {
  NumberAExp,
  IdAExp,
  BasicOperationAExp,
} from '../ast';
import {
  number,
  id,
  keyword,
} from './basic';
import { LazyParser } from '../../../src/combinators';
import precedence from './precedence';

/**
 * 获取AExp的实际值
 */

function aexpValue() {
  return number.do(i => new NumberAExp(i)).or(id.do(v => new IdAExp(v)));
}

/**
 * 括号表达式提值函数
 */

function _processGroup(parsed) {
  return parsed[0][1];
}

/**
 * 解析括号表达式
 */

function aexpGroup() {
  return keyword('(').concat(new LazyParser(aexp)).concat(keyword(')')).do(_processGroup);
}

/**
 * AExp表达式项
 */

function aexpTerm() {
  return aexpValue().or(aexpGroup());
}

/**
 * 算数表达式优先级
 */

const _aexpPrecedenceLevels = [
  ['*', '/'],
  ['+', '-'],
];

function _processBasicOperation(op) {
  return (l, r) => new BasicOperationAExp(op, l, r);
}

/**
 * AExp表达式
 */

function aexp() {
  return precedence(aexpTerm(), _aexpPrecedenceLevels, _processBasicOperation);
}


export default aexp;
export {
  aexpValue,
  aexpGroup,
  aexpTerm,
};
