/**
 * 这里的语法对应于IMP的最基础语法集合，只是一个标志类
 * 语法参照http://fsl.cs.illinois.edu/images/5/52/CS422-Fall-2013-02a-IMP.pdf里的Fig.3.1
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
