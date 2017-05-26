import { keyword } from './basic';

/**
 * 是否有操作符在列表中
 */

function _anyOperatorInList(ops) {
  const opParsers = ops.map(op => keyword(op));
  const parser = opParsers.reduce((l, r) => l.or(r));
  return parser;
}

/**
 * 优先级处理函数
 */

function precedence(valueParser, precedenceLevels, combine) {
  const opParser = precedenceLevel => _anyOperatorInList(precedenceLevel).do(combine);
  let parser = valueParser.join(opParser(precedenceLevels[0]));
  for (let i = 1; i < precedenceLevels.length; i += 1) {
    parser = parser.join(opParser(precedenceLevels[i]));
  }
  return parser;
}

export default precedence;


// def any_operator_in_list(ops):
//     op_parsers = [keyword(op) for op in ops]
//     parser = reduce(lambda l, r: l | r, op_parsers)
//     return parser


// def precedence(value_parser, precedence_levels, combine):
//     def op_parser(precedence_level):
//         return any_operator_in_list(precedence_level) ^ combine
//     parser = value_parser * op_parser(precedence_levels[0])
//     for precedence_level in precedence_levels[1:]:
//         parser = parser * op_parser(precedence_level)
//     return parser
