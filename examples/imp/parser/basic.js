/**
 * 这里是IMP专属的一些基础的解析器
 */

import {
  ReservedParser,
  TagParser,
} from '../../../src/combinators';

import {
  RESERVED,
  NUMBER,
  ID,
} from '../tokenExprs';

/**
 * 关键字解析器
 */

function keyword(name) {
  return new ReservedParser(name, RESERVED);
}

/**
 * 数字型解析器
 */

const number = new TagParser(NUMBER).do(i => parseInt(i, 10));

/**
 * 变量解析器
 */

const id = new TagParser(ID);


export {
  keyword,
  number,
  id,
};
