/**
 * 这里是一系列IMP的布尔表达式(BExp)解析器
 */

import {
  RelationalOperationBExp,
  NotBExp,
  AndBExp,
  OrBExp,
} from '../ast';
import {
  keyword,
} from './basic';
import aexp from './aexp';
import { LazyParser } from '../../../src/combinators';
import precedence, { anyOperatorInList } from './precedence';

const _relops = ['<', '<=', '>', '>=', '=', '!='];

/**
 * 布尔表达式转化AST
 */

function _processRelop(parsed) {
  // [[left, op], right]
  return new RelationalOperationBExp(parsed[0][1], parsed[0][0], parsed[1]);
}

/**
 * 布尔表达式提值函数
 */

function _processGroup(parsed) {
  return parsed[0][1];
}

const _temp = {
  bexp: null,
  bexpTerm: null,
};

/**
 * AExp布尔表达式解析器
 */

function bexpRelationalOperation() {
  return aexp().concat(anyOperatorInList(_relops)).concat(aexp()).do(_processRelop);
}

/**
 * 布尔括号表达式
 */

function bexpGroup() {
  return keyword('(').concat(new LazyParser(_temp.bexp)).concat(keyword(')')).do(_processGroup);
}

/**
 * 布尔否表达式
 */

function bexpNot() {
  return keyword('not').concat(new LazyParser(_temp.bexpTerm)).do(parsed => new NotBExp(parsed[1]));
}

/**
 * 布尔表达式项
 */

function bexpTerm() {
  return bexpNot().or(bexpRelationalOperation()).or(bexpGroup());
}
_temp.bexpTerm = bexpTerm;

/**
 * 布尔表达式优先级
 */

const _bexpPrecedenceLevels = [
  ['and'],
  ['or'],
];

function _processLogic(op) {
  if (op === 'and') {
    return (l, r) => new AndBExp(l, r);
  } else if (op === 'or') {
    return (l, r) => new OrBExp(l, r);
  }
  throw new Error('unknown logic operator: ' + op);
}

/**
 * BExp表达式
 */

function bexp() {
  return precedence(bexpTerm(), _bexpPrecedenceLevels, _processLogic);
}
_temp.bexp = bexp;

export default bexp;
export {
  bexpRelationalOperation,
  bexpGroup,
  bexpNot,
  bexpTerm,
};
