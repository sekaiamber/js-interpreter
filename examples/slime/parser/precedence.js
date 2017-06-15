import { keyword } from './basic';

/**
 * 是否有操作符在列表中
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
  let parser = valueParser.join(opParser(precedenceLevels[0]));
  for (let i = 1; i < precedenceLevels.length; i += 1) {
    parser = parser.join(opParser(precedenceLevels[i]));
  }
  return parser;
}

export default precedence;
export {
  anyOperatorInList,
};
