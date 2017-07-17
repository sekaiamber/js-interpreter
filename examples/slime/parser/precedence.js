import { keyword } from './basic';

/**
 * 获得一个能识别给定所有操作符的解析器
 */

function anyOperatorInList(ops) {
  const opParsers = ops.map(op => keyword(op));
  const parser = opParsers.reduce((l, r) => l.or(r));
  return parser;
}

/**
 * 优先级处理函数
 */

function precedence(valueParser, precedenceLevels, combine) {
  const opParser = precedenceLevel => anyOperatorInList(precedenceLevel).do(combine);
  let parser = valueParser;
  for (let i = 0; i < precedenceLevels.length; i += 1) {
    parser = parser.join(opParser(precedenceLevels[i]));
  }
  return parser;
}

export default precedence;
export {
  anyOperatorInList,
};
