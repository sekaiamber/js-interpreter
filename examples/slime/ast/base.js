/**
 * 这里的语法对应于Slime的最基础语法集合，只是一个标志类
 */

import Equality from '../../../src/utils/equality';


class Stmt extends Equality {}
class AExp extends Equality {}
class BExp extends Equality {}

export {
  Stmt,
  AExp,
  BExp,
};
