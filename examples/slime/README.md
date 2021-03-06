# Slime 语言解释器实现

*注：这里都从本项目的根目录开始。*
**在线测试在[这里](https://sekaiamber.github.io/js-interpreter/pages_dist/slime.html)**

解释执行分为4个阶段：

* 词法分析：分词输入，获得token
* 语法分析：建立抽象语法树(AST)，这个语法树根上下文无关
* 语义分析：分析上下文语法，检查语义，是否合规，比如变量无法像函数一样被调用
* 执行

整体执行可以直接用`Slime`入口：

```javascript
import Slime from './examples/slime';

const slime = new Slime();
const result = slime.eval('a = 1');
console.log(result);
// {
//   _tokens: ...,
//   result: 1,
//   env: {
//     a: 1
//   }
// }
```

## 词法分析

```javascript
import { SlimeLexer } from './examples/slime';

const tokens = new SlimeLexer.lex(code);
```

## 语法分析

```javascript
import { SlimeParser } from './examples/slime';

const parseResult = SlimeParser.parse(tokens, 0);
```

## 语义分析

当前没做。当前将在执行时报错。如果要做解释器优化，这一步是必须做的，可以在执行前就排除一些错误。

## 执行

```javascript
import { SlimeParser } from './examples/slime';

const parseResult = SlimeParser.parse(tokens, 0);
const ast = parseResult.value;
const env = { ... }; // 设置全局环境
const result = ast.eval(env);
```