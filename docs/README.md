# 使用JavaScript编写解释器

在各个编程领域中，逼格比较高的，大概就有编写编译器和解释器了。当我们听说一个人“曾用XXX编写过XXX的解释器”这样的话语时，基本上已经认同了那个人大神的实力。

纵然，编写某种复杂编程语言的解释器是一件浩大的工程，然而事实上，编写一些相对简单的语言或者定制自己的语言时，这种解释器并没有想象中的那么复杂，在这篇文章里，我不会讲述那些生涩的数学公式和绕人的底层原理，只是通过实现一个最最简单可用的解释器来展示解释器是如何工作的。

本项目的代码选择使用JavaScript实现，不仅因为她十分容易理解，也因为她在浏览器端也能执行。

## 0x00 解释器原理

事实上解释器和编译器刚开始做的工作差不多，都需要把原始代码表示为更容易被计算机接受的格式，这种方式被称为**中间表示**(intermediate representation, IR)。编译器也许将IR表示为字节码，以便日后快速执行，而解释器没有编译过程，它将IR表示为内存中更加容易被执行的一些东西，它们将被立即执行。

废话不多说，大概九成的解释器在执行代码时遵循下面4个步骤：


1. 词法分析
2. 语法分析
3. 语义分析
4. 执行


这4个步骤是先贤们总结出来的当前最为科学的执行条件和顺序，事实上如果我们仔细思考一下，这4个步骤跟人类本身读代码的方式是一致的：


1. 词法分析：阅读代码，分离了一个个`词语`，这些`词语`代表了变量名、常量、关键字等等意思。
2. 语法分析：通过逐个组合这些`词语`，并知道这些`词语`能组成特定功能的`语句`，比如赋值语句、判断语句等等。
3. 语义分析：仔细观察这些`语句`，有些语句似乎写的不像样，比如在C语言中：
    ```c
    a = 1;
    b = a[0];
    ```
    上例中`a`是个数字，而`b`将`a`当成数组在引用。从语法上来说没有错，然而从语义上却存在错误。
4. 执行：当通读检查完所有代码，就开始通过一套特定的规则来执行代码。


那么，具体在实现上，我们需要对这4个步骤做些什么事呢？请不要过分关注各种特定词汇，接下来的具体实现中会详细解释这些概念。


1. 词法分析：我们需要实现一个词法分析器(Lexer)，这个玩意儿接收原始代码，并生成对应的记号(Token)序列。这个Token序列精确的分割了原始代码，并且标记出每个Token的类型。
2. 语法分析：我们需要实现一个语法解析器(Parser)，这个东西接收Token序列，并输出对应的抽象语法树(abstract syntax tree, AST)，我们将实现一套最基础的通用的组合子(combinator)，并通过结合这些组合子来定制目标语言的Parser。
3. 语义分析
    1. 在本文中，我不会做这项工作。事实上，语义分为静态语义和动态语义，语义分析主要关注静态语义的分析工作，而这部分内容当程序运行时也能进行自动检查。这部分工作其实是**必要的**，然而为了简洁，我将这部分省去，日后再实现。
    2. 从实现上来讲，我们需要实现一个语义分析器(Analyzer)，我们需要对AST进行深度优先遍历，逐个对每个AST节点进行注释，通过检查整个树来确定静态语义的正确性。
    3. 很多时候，解释器跟编译器一样，在语义分析之后，会对AST进行优化，使得程序执行更有效率，这部分优化包含很多部分，例如`a = 1 + 2`即可优化为`a = 3`，这叫做**常量合并**，再如`a = 1; a = 2;`即可优化为`a = 2`，这叫**删除无用代码**，再如一些循环优化等等，这是十分有学问的工程，很多编译器都有优化等级的概念，就是因为优化会对原始AST进行修改，可能会造成意想不到的结果，越高的优化等级，要求原始代码的格式和编写越苛刻。
4. 执行：我们将在AST类中实现执行代码，使用JavaScript来执行这个AST，最后输出程序结果。

了解解释器的原理可以有助于我们设计合理的领域特定语言(DSL)，优化已有的代码，甚至编写自己的代码高亮和提示工具。

## 0x01 Slime语言

我想找一个简答的语言来作为这个项目的第一个实例。所以我搞了一个很简单的语言，它叫做Slime（史莱姆，RPG游戏中最低级的怪）。

这个语言是专属于本文的毫无用处的语言，结构十分简单，通过文章描述，可以得知Slime简直就是一种最最基础的编程语言：
* 拥有顺序、判断、循环3种基本结构
* 没有函数、类等高级功能
* 全部变量，没有作用域
* 只有整形，没有其他类型

Slime的语法例子如下：

```ruby
1 # 数字值
x # 变量值
1 + 1 # 四则运算
x + 1 # 包含变量的四则运算
1 + 1 + x # 复合四则运算

1 < 2 # 逻辑运算
x == 1
not y # 与或非逻辑
1 < 2 or 2 < 3
1 < 2 and 2 < 3

x = 1; # 赋值
x = 1; y = 2; # 复合语句
# 判断
if 1 < 2 then
  x = 2;
else
  x = 3;
end
# 循环
while 1 < 2 do
  x = x + 1;
end
```

## 0x02 实现词法分析器(Lexer)

从行为上来看，一个`Lexer`需要接收原始代码，并输出相应的`Token`列表。

`Token`拥有本身的字面量和类型。所以我们先来定义`Token`类：

`src/token.js`
```javascript
class Token {
  constructor(value, tag) {
    this.value = value;
    this.tag = tag;
  }
}
```
十分简单对不对？

`Lexer`的功能其实十分简单：根据一定的规则对源代码进行分词处理。这个规则一般使用正则表达式来判定。

让我们来看一下Slime的分词规则，它拥有一个**正则表达式**和一个**tag类型**，我们希望Lexer能接受如下格式的规则：

`examples/slime/tokenExprs.js`
```javascript
const NONE = 0x00;
const RESERVED = 0x01;
const ID = 0x02;
const NUMBER = 0x03;

const tokenExprs = [
  // 分割
  [/^[ \n\t]+/, NONE],
  [/^#[^\n]*/, NONE],
  // 优先级和代码块
  [/^\(/, RESERVED],
  [/^\)/, RESERVED],
  [/^;/, RESERVED],
  // 基础运算符
  [/^\+/, RESERVED],
  [/^-/, RESERVED],
  [/^\*/, RESERVED],
  [/^\//, RESERVED],
  [/^<=/, RESERVED],
  [/^</, RESERVED],
  [/^>=/, RESERVED],
  [/^>/, RESERVED],
  [/^!=/, RESERVED],
  [/^==/, RESERVED],
  [/^and/, RESERVED],
  [/^or/, RESERVED],
  [/^not/, RESERVED],
  // 逻辑
  [/^if/, RESERVED],
  [/^then/, RESERVED],
  [/^else/, RESERVED],
  [/^while/, RESERVED],
  [/^do/, RESERVED],
  [/^end/, RESERVED],
  // 变量和赋值
  [/^=/, RESERVED],
  [/^[0-9]+/, NUMBER],
  [/^[A-Za-z][A-Za-z0-9_]*/, ID],
];
```

Lexer将拥有一个`lex`函数，这个函数接受一个字符串，并且从头开始逐个匹配词汇库内的正则表达式，若符合规则，则提取相应的字面量和tag并生成一个`Token`塞入Token序列中，再接着对后面的字符串进行处理。

`src/lexer.js`
```javascript
class Lexer {
  constructor() {
    this.tokenExprs = [];
  }
  lex(characters) {
    let pos = 0;
    const tokens = [];
    // 逐个处理字符串
    while (pos < characters.length) {
      let match = null;
      let matchText = null;
      const subCharacters = characters.substr(pos);
      // 遍历词汇库
      for (let i = 0; i < this.tokenExprs.length; i += 1) {
        const { pattern, tag } = this.tokenExprs[i];
        match = subCharacters.match(pattern);
        if (match) {
          matchText = match[0];
          if (tag) {
            // 注意：这里抛弃了tag为NONE的Token
            // 因为这些是分隔符没有意义
            const token = new Token(matchText, tag);
            tokens.push(token);
          }
          break;
        }
      }
      // 遇到词汇库中不存在的词汇则抛出异常
      if (!match) {
        throw new Error(`Illegal character: ${subCharacters[0]}`);
      }
      // 后移字符串处理指针
      pos += matchText.length;
    }
    return tokens;
  }
}
```

可以看到我们在顺序遍历词汇库，所以词汇库将优先匹配数组顶端的元素，所以正则表达式的排列顺序是有讲究的。我们应该先排列分隔符，然后是关键字和运算符，最后才是变量和常量。

这时候我们的Lexer应该已经可以使用了：

```javascript
const lexer = new Lexer();
for (let i = 0; i < tokenExprs.length; i += 1) {
  const tokenExpr = tokenExprs[i];
  //  这里我实现了一个添加正则表达式的函数
  lexer.addTokenExpression(tokenExpr[0], tokenExpr[1]);
}
const tokens = lexer.lex('a = 1');
console.log(tokens);
// [
//   Token{ value: 'a', tag: 2 },
//   Token{ value: '=', tag: 1 },
//   Token{ value: '1', tag: 3 }
// ]
```

更多关于Lexer的测试可以参照`test/slime/lexer.js`。

## 0x03 语法解析器 -- 解析器组合子

语法解析器部分，是整个解释器的核心，它的功能是消费Token列表并输出抽象语法树AST。从代码行为上来看，一个解析器能识别出特定语法的语句，例如赋值解析器可以解析`a = 1`，而无法解析`a + 1`。

**注意：从这章开始，所有不是代码块的代码，或者说所有行内代码，都可能是伪代码，无法直接执行，只是表明意思。但是所有代码块的代码均是从项目中复制出来的，并且标示了源文件的目录地址。**

### 什么是抽象语法树AST

树，就是一种数据结构，大家都懂的。

在编译器和解释器中，它们一般会把Token序列转化为更易理解的分析树(parse tree)或者语法树(syntax tree)。

例如某段程序就一行代码，就是赋值：`a = 1`。

让我们来看看这段程序的分析树大概长这样：

```
    <Program>
        |
    <Assign>
     /  |  \
 <ID>  '=' <Number>
  |            |
  x            1
```

这根树将源代码一一对应到树的节点上，并且精确描述了这个**源代码**的构成，可以很容易的从源代码推断出分析树，也可以很简单的逆向推出源码。

*注：事实上这行代码的分析树更加复杂，它需要考虑到复合四则运算等情况，这里只是一个简单的展示*

而语法树就是用来表示语法的树，这种树将**程序源码的语法**，表示为树的形式，那么他的语法树也许就长这样：

```
  <Program>
      |
   <Assign>
    /    \
   x      1
```

语法树忽略了源代码上许多细节，将本质抽象出来，例如在这里我们忽略了`=`，更多的时候，例如在描述代数表达式的时候，语法树比分析树更加具有优势，因为他会忽略`(`和`)`等符号，并且将运算优先级表现在树上。

所以通过上面的说明，**分析树也被叫做具体语法树(concrete syntax tree, CST)，而语法树则被称为抽象语法树(AST)**。

很多时候，编译器和解释器将直接生成AST，也有情况是它们先生成CST再在基础上生成AST，也有很多时候它们是互相缠绕在一起，生成一些类似的东西。

### 什么是解析器组合子

编写语法解析器有好多方法，使用解析器组合子大概是最简单最优雅的一种了。

解析器组合子事实上来源于函数式编程，它实际上是一个**高阶函数**，这意味着它需要输入一个或几个函数，然后再输出一个函数，放到我们这儿，也就是说解析器组合子将输入一个或几个解析器然后输出一个新的解析器。

在JavaScript中，我们可以简单地把组合子也看成一种解析器，然后把组合过程当成所有解析器中都继承的函数。解析器组合子明显的一个好处是，因为它脱胎于函数式编程，所以表现在JavaScript上，可以很方便的做到**链式调用**。

我将编写一个最最简单基础的解析器组合子库，用这些基础组合子来拼出一些稍微复杂的组合子，最后针对Slime语言构建出它的语法解析器。

从下文开始，为了方便描述，我将对所有的基础组合子、复杂组合子以及由这些组合子产生的新的解析器，统称为解析器。

先做基础解析器，也是因为组合子逻辑跟实际语法无关，基础的解析器可以用到任何语言上。

### 基础解析器

在写基础解析器之前，我们要做点额外的工作。

首先来确定一下组合子接口，JS里没有接口，这儿我们简单的创建了一个基类来当做接口。

`src/combinators/parser.js`
```javascript
/**
 * 解析器基类
 */

class Parser {
  concat(other) {
    return new ConcatParser(this, other);
  }
  or(other) {
    return new AlternateParser(this, other);
  }
  do(handler) {
    return new ProcessParser(this, handler);
  }
  join(other) {
    return new ExpressionParser(this, other);
  }
  parse() {
    throw new Error('Cannot use base class Parser');
  }
}
```

这个基类拥有5个接口，其中`concat`、`or`、`do`、`join`分别是组合子逻辑的实现函数，在下面会一一实现这些解析器，`parse`函数是消费Token的入口，它将返回解析的结果。

然后我们来定义一下`Result`类，这个类没其他作用，只是一个`Parser.parse`函数调用以后的结果的包装，如果正确解析的话，这个函数将返回包装了解析结果和Token序列索引的一个`Result`。

`src/combinators/result.js`
```javascript
export default class Result {
  constructor(value, pos) {
    this.value = value;
    this.pos = pos;
  }

  toString() {
    return `Result(${this.value}, ${this.pos})`;
  }
}
```

接下来，我们将首先实现`Parser`基类中的一系列基础解析器。

#### ConcatParser -- 连接解析器

连接解析器(`parser.concat`)的作用是，接受两个解析器，将它们连接起来。

举个栗子，假设我们有关键字解析器，能解析`+`这个关键字字符，又有常量解析器，能解析`1`或者`2`这样的常量。那么若是要解析`1 + 2`这样的常量加法语句，就可以用`常量解析器.concat(关键字解析器(+)).concat(常量解析器)`来获得这个常量加法语句的解析器。

所以它很简单，实例化的时候接收左右两个解析器，解析的时候先执行左边的解析器，再执行右边的解析器：

`src/combinators/parser.js`
```javascript
/**
 * 基础解析器-连接
 * 这个解析器将接一个左解析器和一个右解析器，他先执行左解析器，再执行右解析器
 */

class ConcatParser extends Parser {
  constructor(left, right) {
    super();
    this.left = left;
    this.right = right;
  }

  parse(tokens, pos) {
    const leftResult = this.left.parse(tokens, pos);
    if (leftResult) {
      const rightResult = this.right.parse(tokens, leftResult.pos);
      if (rightResult) {
        return new Result([leftResult.value, rightResult.value], rightResult.pos);
      }
    }
    return null;
  }
}
```

请仔细体会其中的`pos`变化，因为消耗了token序列，所以将后移这里的token序列位置。

正常解析的时候，将返回`new Result([leftResult.value, rightResult.value], rightResult.pos)`，这里将左右解析器的结果拿出来，并打包起来作为整个解析器的结果，消耗的token序列位置就是右解析器的位置。

#### AlternateParser -- 或解析器

或解析器(`parser.or`)的作用是，接受两个解析器，将它们连接起来，若第一个解析器解析成功，则返回解析结果，否则返回第二个解析器的解析结果。

举个栗子，有4个关键字解析器，能分别解析`+`、`-`、`*`、`/`，那么就可以用`关键字解析器(+).or(关键字解析器(-)).or(关键字解析器(*)).or(关键字解析器(/))`来产生四则运算解析器。

跟`ConcatParser`类似，只是`parse`函数有些微区别：

`src/combinators/parser.js`
```javascript
/**
 * 基础解析器-或
 * 这个解析器先执行左解析器，如果有值，则返回，否则返回右解析器结果
 */

class AlternateParser extends Parser {
  constructor(left, right) {
    super();
    this.left = left;
    this.right = right;
  }

  parse(tokens, pos) {
    const leftResult = this.left.parse(tokens, pos);
    if (leftResult) return leftResult;
    const rightResult = this.right.parse(tokens, pos);
    return rightResult;
  }
}
```

这里token序列的消耗其实就是以执行的解析器为准。

#### ProcessParser -- 解析处理器

这个解析器呢，说实话应该是个处理器，它对应到`parser.do`，他接收一个解析器和一个处理函数，并在解析器解析成功时，使用处理函数来处理返回的Result，并返回一个新的Result。换一种说法，它的作用是用来处理AST，并返回真实的结果。

举个例子，在`ConcatParser`的例子中，我们解析了`1 + 2`这样的语句，最后返回的应该类似`[[1, +], 2]`这样的东西，看起来是不是十分难受，于是我们搞一个处理函数（只是举例）：

```javascript
function (parsed) {
  const left = parsed[0][0];
  const right = parsed[1];
  return left + right;
}
```

这样，我们就能将结果从`[[1, +], 2]`变成`3`，整个AST产生之后，就是以处理器来计算整个AST获得最终结果。

`src/combinators/parser.js`
```javascript
/**
 * 基础解析器-处理
 * 这个解析器将接收一个解析器和一个处理函数，这个函数将处理Result.value并且返回真正的值。
 * 这个解析器是执行代码的核心。
 */

class ProcessParser extends Parser {
  constructor(parser, handler) {
    super();
    this.parser = parser;
    this.handler = handler;
  }

  parse(tokens, pos) {
    const result = this.parser.parse(tokens, pos);
    if (result) {
      result.value = this.handler(result.value);
      return result;
    }
    return null;
  }
}
```

处理器的本质是包装一个解析器变成一个新的解析器，它匹配的语句跟原本的解析器完全一样，只不过输出的东西是经过处理函数包装的。

#### ExpressionParser -- 复合表达式解析器

这个解析器是各个基础解析器中最复杂也是最难理解的一个，他的目的说起来很简单，他为了解析类似这样的内容：`a = 1; b = 2; c = 3`，以某些语句做分割(`;`)的一类语句。这里的分割是某种表达式，他们分割的内容是另一种表达式。

举个最简单的例子来说：`1 + 2 + 3`或者`1 + 2 + 3 + 4`这样的不定量的复合四则运算，也许你觉得用上面的`ConcatParser`很简单的嘛：

1. 先假设表达式`number`表示数字的解析器
2. 那么复合语句`compoundStmt`就是类似`compoundStmt = compoundStmt.concat(+).concat(number)`这样的形式，
3. 再回过头看看`compoundStmt`，他本身依赖了自己

这里可以看到，在实例化的时候，`compoundStmt`将一直调用构造器，直到栈溢出。这种情况，从实质上来看，就是这种语法以某种语法元素开头，这种语法元素，本身或者经过推断就是语法本身，在编译原理中被称为[左递归](https://en.wikipedia.org/wiki/Left_recursion)，所有的自左向右自顶向下分析的语法分析器，都要避免这种情况。

这儿我们提出的方案，是使用分割的形式来解决这方面的需求。所以它对应到`parser.join`，它接受两个解析器，第一个是内容解析器，用来匹配内容，第二个是分割解析器，用来匹配分割符或者分割语法。运行的逻辑是首先用内容解析器去匹配，若得到结果就使用分割解析器去匹配分隔语法，如此循环。分割解析器需要返回一个处理函数，用来从左到右依次处理内容解析器匹配到的内容，这个过程也是累加的过程。

`src/combinators/parser.js`
```javascript
/**
 * 表达式解析器
 * 这个解析器主要是为了解决复合语句问题，复合语句在形成解析器的时候会产生左递归，这里使用这个解析器来解决问题。
 */

class ExpressionParser extends Parser {
  constructor(parser, separator) {
    super();
    this.parser = parser;
    this.separator = separator;
  }

  parse(tokens, pos) {
    let result = this.parser.parse(tokens, pos);
    const nextFactory = (parsed) => {
      // 这个函数就是separator产生的处理函数
      const sepfunc = parsed[0];
      const right = parsed[1];
      return sepfunc(result.value, right);
    };
    const nextParser = this.separator.concat(this.parser).do(nextFactory);
    let nextResult = result;
    while (nextResult) {
      nextResult = nextParser.parse(tokens, result.pos);
      if (nextResult) {
        result = nextResult;
      }
    }
    return result;
  }
}
```

来举个测试里的例子更加说明问题：

`test/slime/combinators.js`
```javascript
// separator的do函数将返回一个处理函数，这个处理函数的意思是，将左右两个值相加
let separator = new ReservedParser('+', RESERVED).do(() => (l, r) => l + r);
// 使用join返回一个ExpressionParser，以ID为内容解析器，用上面的separator作为分割解析器
let parser = new TagParser(ID).join(separator);
const token1 = lexer.lex('a');
const result1 = parser.parse(token1, 0);
const token2 = lexer.lex('a + b');
const result2 = parser.parse(token2, 0);
// 解析的时候，首先用ID去匹配到了a
// 然后内部构造了一些东西，看上面的源码，这时候匹配到`+`和后面的`b`，然后执行separate的do返回的处理函数，得到`a + b => ab`
// 获得`ab`以后，接下去匹配，匹配到`+`和后面的`c`，执行处理函数，得到`ab + c => abc`
const token3 = lexer.lex('a + b + c');
const result3 = parser.parse(token3, 0);
expect(result1.value).to.equal('a');
expect(result2.value).to.equal('ab');
expect(result3.value).to.equal('abc');

// 这里提供了一个更加复杂和实际的用法
// separator的do根据传入的不同操作符，返回不同的处理函数，用来做加法和减法
separator = (
  new ReservedParser('+', RESERVED)
  .or(new ReservedParser('-', RESERVED))
  .do((operator) => {
    if (operator === '+') return (l, r) => parseFloat(l) + parseFloat(r);
    return (l, r) => parseFloat(l) - parseFloat(r);
  })
);
parser = new TagParser(NUMBER).join(separator);
const token4 = lexer.lex('1 + 2');
const result4 = parser.parse(token4, 0);
const token5 = lexer.lex('1 + 2 - 4');
const result5 = parser.parse(token5, 0);
expect(result4.value).to.equal(3);
expect(result5.value).to.equal(-1);
```

到此为止，我们最基本的`Parser`类已经构建完成，以后所有的其他解析器类，只要继承`Parser`基类，都能享受到上述4种组合方式，从而构建更加复杂的解析器。

### 其他基础解析器

我们事先了解析器基类，它提供了一套很通用的组合子函数，但是有些基础功能，写一些其他的基本解析器能解决很多问题，这一小节就来罗列以后需要的一些解析器。

#### ReservedParser -- 关键字解析器

这个解析器十分基础，它的作用就是匹配关键字，它接受一个值和一个类型来匹配关键字，解析时接收一个token，若token的tag和值跟解析器的期望相同，则返回值。

`src/combinators/reservedParser.js`
```javascript
/**
 * 关键字解析器
 * 这个解析器将接收指定tag指定值的token。
 */
export default class ReservedParser extends Parser {
  constructor(value, tag) {
    super();
    this.value = value;
    this.tag = tag;
  }

  parse(tokens, pos) {
    if (pos < tokens.length) {
      const token = tokens[pos];
      // 若value和tag相同则返回
      if (token.value === this.value && token.tag === this.tag) {
        return new Result(token.value, pos + 1);
      }
    }
    return null;
  }
}
```

这个解析器虽然简单，但却是最常用的解析器之一，常见的方式是和`ConcatParser`连用：

```javascript
const parser = new ReservedParser('(', RESERVED)
  .concat(new TagParser(NUMBER))
  .concat(new ReservedParser(')', RESERVED))
```

上面那个毫无作用的parser能解析`(1)`或者`(999)`这样的语法。

#### TagParser -- 标记解析器

这个解析器和上面的`ReservedParser`十分相似，只不过他只匹配类型就够了。解析时只要token符合这个类型即可。

`src/combinators/tagParser.js`
```javascript
/**
 * 标记解析器
 * 这个解析器跟Reserved解析器很相似，只不过他只要求token是指定tag即可。
 */
export default class TagParser extends Parser {
  constructor(tag) {
    super();
    this.tag = tag;
  }

  parse(tokens, pos) {
    if (pos < tokens.length) {
      const token = tokens[pos];
      // 只要类型一样即可返回
      if (token.tag === this.tag) {
        return new Result(token.value, pos + 1);
      }
    }
    return null;
  }
}
```

这个解析器主要用在匹配变量和值上，例子在上面`ReservedParser`已经展示了。

#### OptionParser -- 可选解析器

这个解析器主要用在可能解析不一定存在的语句上，最常见的用处就是`if else`语句，其中`else`关键字以及后面的语句可能是不存在的。他在成功的时候返回解析内容，但跟其他解析器不同，解析失败的时候也将返回一个`Result`，只不过不消耗token序列。（换句话说，这个解析器永远是成功的，所以叫做可选解析器）

`src/combinators/optionParser.js`
```javascript
/**
 * 可选解析器
 * 这个解析器接受一个解析器，解析时如果这个解析器有值，则返回，否则返回一个占位的result返回原来的pos。
 * 这个解析器通常运用在某些可选语法中，比如`if else`，这个`else`可能是不存在的。
 */
export default class OptionParser extends Parser {
  constructor(parser) {
    super();
    this.parser = parser;
  }

  parse(tokens, pos) {
    const result = this.parser.parse(tokens, pos);
    if (result) return result;
    return new Result(null, pos);
  }
}
```

要仔细体会一下这个解析器和`AlternateParser`的区别，前者只接受一个解析器，后者接收两个，前者其实是一种占位措施，表示匹配元素**可能没有**，所以永远是解析成功的，而后者表示两者中有一个，否则解析失败。

#### RepeatParser -- 重复解析器

重复解析器也很简单，他的作用就是匹配一类不断重复的语法，直到匹配失败，最常见的是匹配定义数组的语法。值得注意的是，倘若第一次匹配就失败的时候，它任然返回成功，只不过结果的值为一个空数组。

`src/combinators/repeatParser.js`
```javascript
/**
 * 重复解析器
 * 这个解析器接受一个解析器，解析时将不停得消耗Token，直到失败为止，返回之前的所有Results
 */
export default class RepeatParser extends Parser {
  constructor(parser) {
    super();
    this.parser = parser;
  }

  parse(tokens, pos) {
    const results = [];
    let resultPos = pos;
    let result = this.parser.parse(tokens, pos);
    // 若失败则返回空数组
    while (result) {
      results.push(result.value);
      resultPos = result.pos;
      result = this.parser.parse(tokens, resultPos);
    }
    return new Result(results, pos);
  }
```

#### LazyParser -- 惰性解析器

这个解析器应该算是除了`ExpressionParser`外最难理解的解析器了。他接收一个输出解析器实例的函数，用来在解析时当场生成解析器。这是因为有些语法可能包含自身，比如算数表达式的也可能包含另一个算术表达式。那么这种递归情况就需要用当场生成解析器解析器来解决。

`src/combinators/lazyParser.js`
```javascript
/**
 * 惰性解析器
 * 这个解析器接受一个解析器生成函数，只有当调用到的时候，才会去生成解析器。
 */
export default class LazyParser extends Parser {
  constructor(parserFactory) {
    super();
    this.parser = null;
    this.parserFactory = parserFactory;
  }

  parse(tokens, pos) {
    if (!this.parser) {
      this.parser = this.parserFactory();
    }
    return this.parser.parse(tokens, pos);
  }
}
```

值得注意的一点，同为破解递归的方式，`LazyParser`和`ExpressionParser`针对的情况不同，`ExpressionParser`的目的是为了将某些被特定语法分隔的语法的结果逐一累计操作，并输出一个结果，而`LazyParser`纯粹为了解决本身包含本身的情况，它对输入的解析器生成函数没有任何要求。

#### PhraseParser -- 代码完整性解析器

这个解析器的作用很简单，它的目的就是检查token序列有没有被消耗完，若传入它的解析器解析完成之后，token还没被消耗完，则认为代码完整性或者语法有问题。举个栗子：

```ruby
a = 1 +
```

这样的代码，就通不过`PhraseParser`，因为token消耗到`a = 1`的时候，已经结束解析，并且也没有语法对应后面的`+`。

`src/combinators/phraseParser.js`
```javascript
/**
 * 代码完整性解析器
 * 这个解析器接受一个解析器，行为跟这个解析器完全一样，只不过它在这个解析器解析完毕之后，token必须消耗完，否则就返回null。
 */
export default class PhraseParser extends Parser {
  constructor(parser) {
    super();
    this.parser = parser;
  }

  parse(tokens, pos) {
    const result = this.parser.parse(tokens, pos);
    if (result && result.pos === tokens.length) return result;
    return null;
  }
}
```

事实上，这个解析器一般只用于最顶层的解析器，也就是说当我们构造了完整的一个语言的解析器的时候，最后用这个解析器包装一次即可。

## 0x04 编写Slime的AST

上一部分，我构造了一个基本的解析器组合子库，接下来针对Slime语言，我们要使用这些解析器来编写它的AST。我们已经了解了AST是什么东西，但是为什么放在这儿编写AST，编写出来的AST到底用在哪儿？

其实答案很简单，接上一部分，若一个解析器能解析`a = 1`这样的语句，那么从上一部分的解析器parser很有可能得到类似`[[a, =], 1]`这样的结果，这种结果我们不知道它具体代表什么，最好呢，能返回类似`Assign(a, 1)`这样的结果。是不是很熟悉？没错，前一种就是描述树，后一种就是语法树。

也就是说若我们手头上有上面那个语法的AST，我们只要使用`parser.do(v => new ast(v))`这样就能将我们的AST结合到语法解析器中。

并且，AST提供了Slime语言在JavaScript环境下运行的能力，因为我们获得了语法树，我们已经知道了这个语句的抽象含义，将它转化为JavaScript语句就不难了。接下来，我们就着手来编写Slime的AST。

为了更好的了解Slime的语法构成，我们需要将它的语法分门别类，有一种特别有效简单的方法，就是BNF表示法，这个表示法能非常好地配合解析器组合子逻辑。

Slime只有一种数据类型就是正整数类型，Slime拥有变量ID。

Slime拥有两种类型的表达式：`AExp`(代数表达式)和`BExp`(布尔表达式)。其中`AExp`包含数字类型和变量的引用以及四则运算：

`AExp`:
```ruby
1 # 数字值
x # 变量值
1 + 1 # 四则运算
x + 1 # 包含变量的四则运算
1 + 1 + x # 复合四则运算
```

`BExp`:
```ruby
1 < 2 # 逻辑判断
x == 1
not y # 与或非逻辑
1 < 2 or 2 < 3
1 < 2 and 2 < 3
```

Slime包含一系列`Stmt`语句，这部分语句用来控制程序运行：

```ruby
x = 1; # 赋值
x = 1; y = 2; # 复合语句
# 判断
if 1 < 2 then
  x = 2;
else
  x = 3;
end
# 循环
while 1 < 2 do
  x = x + 1;
end
```

整个Slime程序其实就是一个巨大的`Stmt`，以及一个全局变量字典`intList{Id}`。

所以，我们可以得到Slime的BNF表示：

```
<Number> ::= 正整数值
    <Id> ::= 变量引用
  <AExp> ::= <Number>
          |  <Id>
          |  <AExp> + <AExp>
          |  <AExp> - <AExp>
          |  <AExp> * <AExp>
          |  <AExp> / <AExp>
  <BExp> ::= <AExp> < <AExp>
          |  <AExp> > <AExp>
          |  <AExp> <= <AExp>
          |  <AExp> >= <AExp>
          |  <AExp> == <AExp>
          |  <AExp> != <AExp>
          |  not <BExp>
          |  <BExp> and <BExp>
          |  <BExp> or <BExp>
  <Stmt> ::= <Id> = <AExp>
          |  <Stmt>; <Stmt>
          |  if <BExp> then <Stmt> else <Stmt> end
          |  while <BExp> do <Stmt> end
   <Pgm> ::= intList{Id}; Stmt
```

所以，我们只要按照BNF来构造Slime的AST即可。

#### AExp -- 代数表达式

从BNF表示中，我们可以得知，AExp就3种语法：

```
<AExp> ::= <Number>
        |  <Id>
        |  <AExp> + <AExp>
        |  <AExp> - <AExp>
        |  <AExp> * <AExp>
        |  <AExp> / <AExp>
```

1. Number，数字
2. Id，变量引用
3. 四则运算

所以AExp其实就很简单了，首先，我们来构造Number的AExp：

`examples/slime/ast/aexp/number.js`
```javascript
export default class NumberAExp extends AExp {
  constructor(n) {
    super();
    this.number = n;
  }

  eval() {
    return this.number;
  }
}
```

从这个最简单的AST入手，我们来解释一下AST的构造，AST的构造器肯定会接收一些东西，每个AST接收的东西不同，可能是数字，可能是变量名，也有可能是其他AST。而`eval()`函数是AST的执行函数，也就是说在这个函数中，我们使用JavaScript来运行这个AST。这个函数将有一个入参，就是`env`，这个入参其实就是一个全局变量字典，每个AST都能改变全局上的变量。

让我们看一下`env`的例子，也就是Id的AExp，这个AExp很简单，就是从全局字典中取出给定的Id名的真实值：

`example/slime/ast/aexp/id.js`
```javascript
export default class IdAExp extends AExp {
  constructor(name) {
    super();
    this.name = name;
  }

  eval(env) {
    return env[this.name];
  }
}
```

然后就是四则运算的AExp，这个玩意儿稍微复杂一点，其实也很简单，根据BNF，我们知道它的入参肯定是一个运算符和两个其他AExp：

`example/slime/ast/aexp/basicOperation.js`
```javascript
export default class BasicOperationAExp extends AExp {
  constructor(operator, left, right) {
    super();
    this.operator = operator;
    this.left = left;
    this.right = right;
  }

  eval(env) {
    const left = this.left.eval(env);
    const right = this.right.eval(env);
    let value;
    switch (this.operator) {
      case '+':
        value = left + right;
        break;
      case '-':
        value = left - right;
        break;
      case '*':
        value = left * right;
        break;
      case '/':
        value = left / right;
        break;
      default:
        throw new Error(`unknown operator: ${this.operator}`);
    }
    return value;
  }
}
```

执行的时候，它会先去执行左右两边的AExp，然后再根据操作符来执行本身的四则运算。

至此，Slime的代数表达式类型的语句的AST就构成完毕了，根据BNF表示法，这个步骤轻松又愉悦。

#### BExp -- 布尔表达式

同样，观察BNF之后，我们可以看到Slime的BExp拥有以下几种语法：

```
<BExp> ::= <AExp> < <AExp>
        |  <AExp> > <AExp>
        |  <AExp> <= <AExp>
        |  <AExp> >= <AExp>
        |  <AExp> == <AExp>
        |  <AExp> != <AExp>
        |  not <BExp>
        |  <BExp> and <BExp>
        |  <BExp> or <BExp>
```

1. 逻辑比较
2. 非
3. 与
4. 或

所以同样，我们依样画葫芦，先来做逻辑比较的BExp：

`examples/slime/ast/bexp/relationalOperation.js`
```javascript
export default class RelationalOperationBExp extends BExp {
  constructor(operator, left, right) {
    super();
    this.operator = operator;
    this.left = left;
    this.right = right;
  }

  eval(env) {
    const left = this.left.eval(env);
    const right = this.right.eval(env);
    let value;
    switch (this.operator) {
      case '<':
        value = left < right;
        break;
      case '<=':
        value = left <= right;
        break;
      case '>':
        value = left > right;
        break;
      case '>=':
        value = left >= right;
        break;
      case '==':
        value = left === right;
        break;
      case '!=':
        value = left !== right;
        break;
      default:
        throw new Error(`unknown operator: ${this.operator}`);
    }
    return value;
  }
}
```

这个和`BasicOperationAExp`几乎一样，不再赘述。

剩下三个与或非运算也都很简单，就罗列以下：

`examples/slime/ast/bexp/and.js`
```javascript
export default class AndBExp extends BExp {
  constructor(left, right) {
    super();
    this.left = left;
    this.right = right;
  }

  eval(env) {
    const left = this.left.eval(env);
    const right = this.left.eval(env);
    return left && right;
  }
}
```

`examples/slime/ast/bexp/not.js`
```javascript
export default class NotBExp extends BExp {
  constructor(exp) {
    super();
    this.exp = exp;
  }

  eval(env) {
    const exp = this.exp.eval(env);
    return !exp;
  }
}
```

`examples/slime/ast/bexp/or.js`
```javascript
export default class OrBExp extends BExp {
  constructor(left, right) {
    super();
    this.left = left;
    this.right = right;
  }

  eval(env) {
    const left = this.left.eval(env);
    if (left) return true;
    const right = this.left.eval(env);
    return left || right;
  }
}
```

#### Stmt -- 声明语法

Stmt部分主要用来控制程序的执行，从BNF我们能得到以下语法：

```
<Stmt> ::= <Id> = <AExp>
        |  <Stmt>; <Stmt>
        |  if <BExp> then <Stmt> else <Stmt> end
        |  while <BExp> do <Stmt> end
```

1. 赋值语法
2. 复合语句语法
3. 判断结构语法
4. 循环结构语法

Stmt部分的AST主要是用来控制程序运行，以及串联AExp和BExp的。

首先是赋值语法，很简单：

`examples/slime/ast/stmt/assign.js`
```javascript
export default class AssignStmt extends Stmt {
  constructor(name, aexp) {
    super();
    this.name = name;
    this.aexp = aexp;
  }

  eval(env) {
    const value = this.aexp.eval(env);
    env[this.name] = value;
    return value;
  }
}
```

执行`eval()`函数时，它将在`env`全局字典中写入一对键值，用来表示变量。

然后是复合语句，它将依次执行左右两条语句：

`examples/slime/ast/stmt/compound.js`
```javascript
export default class CompoundStmt extends Stmt {
  constructor(first, second) {
    super();
    this.first = first;
    this.second = second;
  }

  eval(env) {
    this.first.eval(env);
    const result = this.second.eval(env);
    return result;
  }
}
```

判断语句也很简单，它接受一个条件，一个当条件为真时执行的语句，以及可选的当条件为假时执行的语句：

`examples/slime/ast/stmt/if.js`
```javascript
export default class IfStmt extends Stmt {
  constructor(condition, trueStmt, falseStmt) {
    super();
    this.condition = condition;
    this.trueStmt = trueStmt;
    this.falseStmt = falseStmt;
  }

  eval(env) {
    const value = this.condition.eval(env);
    if (value) {
      return this.trueStmt.eval(env);
    }
    if (this.falseStmt) {
      return this.falseStmt.eval(env);
    }
    return undefined;
  }
}
```

循环语句在结构上跟判断语句也极其相似：

`examples/slime/ast/stmt/while.js`
```javascript
export default class WhileStmt extends Stmt {
  constructor(condition, body) {
    super();
    this.condition = condition;
    this.body = body;
  }

  eval(env) {
    let value = this.condition.eval(env);
    let ret;
    while (value) {
      ret = this.body.eval(env);
      value = this.condition.eval(env);
    }
    return ret;
  }
}
```

至此，对于Slime这个语言来说，我们已经抽象出了它所有的语法，并且这些AST都能在JavaScript环境下运行了，下一步我们只要使用解析器组合子来构造Slime语言本身的语法解析器，并将Slime的AST接入其中即可。

## 0x04 编写Slime的语法解析器

上一部分，我们已经实现了Slime的AST，这部分我们将使用0x02编写的组合子库来组合出我们所需要的各个语法解析器，再将它们结合0x03的AST使得每个语法可以运行，最后将各个解析器连接起来，最终产生的就是Slime这个语言的解析器了。

我们仍然通过BNF表示的语法类型来各个击破。

在此之前，我们要做一些额外的工作来建立一些最最基础的解析器：

```javascript
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
```

我们分别对`keyword`、`number`、`id`进行了包装，使得后面使用更加方便。

#### AExp解析器

我们仍然从AExp入手，从上一部分我们得知，AExp主要是3种语法，我们复习一下：

1. Number，数字
2. Id，变量引用
3. 四则运算

前2种语法，其实可以被`or`连用，所以我们先来做这部分：

`examples/slime/parser/aexp.js`
```javascript
/**
 * 获取AExp的实际值
 */
function aexpValue() {
  return number.do(i => new NumberAExp(i)).or(id.do(v => new IdAExp(v)));
}
```

从这个最简单的逻辑出发，让我们来理解一下Slime的解析器的构造。这里已经不会再采用类的方式构成解析器了，直接调用函数会更加方便一点。`number`解析器能将到代码`"1"`解析为数字`1`，然后我们将数字`1`转而包装成上一部分编写的`NumberAExp`这个AST用于执行。同理将id包装为`IdAExp`。并用`or`来连接两个解析器，这样这个`aexpValue`产生的解析器能解析任意的数字和变量，并能在执行AST的时候正确的从全局字典中获得真实值。

接着我们来处理比较麻烦的四则运算部分，这一部分相对之前所有的内容来的更加复杂。

四则运算可以包含AExp本身，所以这儿我们肯定会用到`LazyParser`，而且让我们首先定义一下，假设最终我们有个函数`aexp`生成的解析器能解析所有的AExp语法，所以四则运算的解析器内部，需要用`LazyParser`来处理这个`aexp`。

首先我们要处理的是括号表达式的问题，事实上对于语法树来说，括号是没有作用的，因为所有的运算优先级都表示在树上了，所以我们需要一个解析器，能匹配到括号表达式，并正确返回其中的内容：

`examples/slime/parser/aexp.js`
```javascript
/**
 * 括号表达式提值函数
 */
function _processGroup(parsed) {
  // 这里的数据大概长得类似 [['(', value], ')']，我们要提出这个value
  return parsed[0][1];
}

/**
 * 解析括号表达式
 */
function aexpGroup() {
  return keyword('(').concat(new LazyParser(aexp)).concat(keyword(')')).do(_processGroup);
}
```

接下来，我们用`aexpTerm`来连接上面两者，想象一下，所有的独立的AExp代数表达式的项，无外乎上面两种情况。

`examples/slime/parser/aexp.js`
```javascript
/**
 * AExp表达式项
 */
function aexpTerm() {
  return aexpValue().or(aexpGroup());
}
```

下面让我们来处理这个最最棘手的`aexp`，造成这个棘手的元凶，就是运算优先级，若我们直接将`aexpTerm`当做`aexp`使用，那么会造成将`1 + 2 * 3`当做`(1 + 2) * 3`去执行。如何让解析器感知运算优先级，这是个很麻烦的事情。

幸好，我们有`ExpressionParser`，这是一种很反常识的用法。让我们来仔细看一下`aexp`的代码：

`examples/slime/parser/aexp.js`
```javascript
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
```

我们定义了一个`_processBasicOperation`来作为最终接入AST的函数，这部分很好理解，然后我们定义了`_aexpPrecedenceLevels`来决定运算符优先级，这个在形式上也很好理解，然后关键是`precedence`这个函数，通过这个我们结合了AExp的独立解析器`aexpTerm`和刚刚提到的两个东西。让我们看看这个函数是怎么工作的。

其实解决运算优先级的做法，跟解决复合语句类似，首先我们要解决任意乘除运算的解析器`p1`，那么这个解析器就是这样：

```javascript
const p1 = aexpTerm().join(keyword('*').or(keyword('/')).do(_processBasicOperation))
```

这个解析器的意思所有AExp的独立项被乘除运算符分割，也就是说类似下面的语句，都可以被这个解析器解析：

* `1 * 2`
* `1 * 2 / 3`
* `1 * 2 * (其他带括号的代数数表达式)`

到这里为止，是十分符合常识的，于是我们可以依样画葫芦，搞出加减运算解析器：

```javascript
const p2 = aexpTerm().join(keyword('+').or(keyword('-')).do(_processBasicOperation))
```

上面的`p2`就是一个加减运算解析器，我们只需要略作修改就可以使得乘除运算结合进去：

```javascript
const p2 = p1.join(keyword('+').or(keyword('-')).do(_processBasicOperation))
```

是不是很神奇？我们将`p1`作为`ExpressionParser`的内容解析器，就可以使得解析器先优先解析和执行乘除运算，再解析和执行加减运算，从而解决运算优先级的问题。

让我们来看个实际的例子，来解释上面的`p2`是如何解析一个复杂的四则运算的，我们先定义`p0`就是`aexpTerm`，这样比较直观：

```
1 * a + 2 - 3 + b / 4 - (5 + c)
```

这么个算式，若用上面的`p2`去解析，其实是依次经过`p0`和`p1`的：

```javascript
1 * a + 2 - 3 + b / 4 - (5 + c)
// 第一步首先使用aexpTerm去解析每个算数表达式独立项的值，注意最后一个项是一个括号表达式，它也是属于独立的项
p0(1) * p0(a) + p0(2) - p0(3) + p0(b) / p0(4) - p0(5 + c)
// 第二步使用乘除解析器去解析每个项，注意，若项没有被乘除分割，则直接返回本身
p1(1 * a) + p1(2) - p1(3) + p1(b / 4) - p1(5 + c)
// 第三步使用加减解析器去解析剩余的项，我特意加上了括号更加明显
p2((1 * a) + (2) - (3) + (b / 4) - ((5 + c)))
```

这样，使用`ExpressionParser`即可解决运算优先级的问题，继而包装一下上文提到的`precedence`函数，我们就可以解决任意数量的运算符优先级问题了：

`examples/slime/parser/precedence.js`
```javascript
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
```

至此，运算优先级的问题也解决了，我们的`aexp`大功告成，使用这个解析器，我们能识别和执行一切Slime的代数表达式了。

#### BExp解析器

BExp解析器和AExp解析器结构十分类似，也就是依样画葫芦的情况，先复习一下BExp的语法类型：

1. 逻辑比较
2. 非
3. 与
4. 或

一个一个来，逻辑运算，很简单，根据BNF表示，逻辑运算的结构为：`<BExp> ::= <AExp> < <AExp>`，也就是说中间一个运算符，左右各一个`aexp`，所以就很简单：

`examples/slime/parser/bexp.js`
```javascript
const _relops = ['<', '<=', '>', '>=', '==', '!='];

/**
 * 布尔表达式转化AST
 */
function _processRelop(parsed) {
  // [[left, op], right]
  return new RelationalOperationBExp(parsed[0][1], parsed[0][0], parsed[1]);
}

/**
 * AExp布尔表达式解析器
 */
function bexpRelationalOperation() {
  // 中间一个运算符解析器，能解析所有_relops的符号，左右各一个aexp，最后转化为AST
  return aexp().concat(anyOperatorInList(_relops)).concat(aexp()).do(_processRelop);
}
```

然后来处理括号表达式，跟AExp的情况一模一样，我们也假设了`bexp`能解析一切BExp语法：

`examples/slime/parser/bexp.js`
```javascript
/**
 * 布尔表达式提值函数
 */
function _processGroup(parsed) {
  return parsed[0][1];
}

/**
 * 布尔括号表达式
 */
function bexpGroup() {
  return keyword('(').concat(new LazyParser(bexp)).concat(keyword(')')).do(_processGroup);
}
```

至此，逻辑运算的部分解析就搞定了。

然后是逻辑非运算，BNF表示为：`not <BExp>`，关键字后面跟一个BExp，它包含了BExp本身，所以肯定要用到`LazyParser`：

`examples/slime/parser/bexp.js`
```javascript
/**
 * 布尔否表达式
 */
function bexpNot() {
  return keyword('not').concat(new LazyParser(bexpTerm)).do(parsed => new NotBExp(parsed[1]));
}
```

同AExp，我们再来定义布尔表达式独立项，这个项可能是逻辑比较运算，可能是括号表达式，也可能是逻辑非运算，这些项可以参与到`and`和`or`运算中：

`examples/slime/parser/bexp.js`
```javascript
/**
 * 布尔表达式项
 */
function bexpTerm() {
  return bexpNot().or(bexpRelationalOperation()).or(bexpGroup());
}
```

最后，还是运算优先级问题，我们知道`and`的优先级一般是高于`or`的，所以使用AExp那一套就很简单可以构造`bexp`：

`examples/slime/parser/bexp.js`
```javascript
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
```

所以，理解了AExp那一套，BExp也就很容易编写出来了。

#### Stmt解析器

Stmt其实跟上面两者套路一样，先复习一下语法类型：

1. 赋值语法
2. 复合语句语法
3. 判断结构语法
4. 循环结构语法

先来搞定赋值语句，还是老套路，看BNF表示的结构：`<Id> = <AExp>`，很清晰，一个`id`解析器，跟一个`=`关键字，再跟上`AExp`：

`examples/slime/parser/stmt.js`
```javascript
// 赋值语句AST
function _processAssign(parsed) {
  // [[name, _], exp]
  return new AssignStmt(parsed[0][0], parsed[1]);
}

/**
 * 赋值语句
 */
function stmtAssign() {
  return id.concat(keyword('=')).concat(aexp()).do(_processAssign);
}
```

复合语句也很简单，我们也假设一个`stmt`能解析一切Stmt语法，复合语句的BNF是：`<Stmt>; <Stmt>`，就是以`;`为分割的`stmt`，这儿为了保持语法的一致，所以我们在复合语句的最后边加上一个可有可无的`;`做结尾：

`examples/slime/parser/stmt.js`
```javascript
/**
 * 语句列表
 */
function stmtList() {
  const separator = keyword(';').do(() => (l, r) => new CompoundStmt(l, r));
  return new ExpressionParser(stmt(), separator).concat(new OptionParser(keyword(';'))).do(parsed => parsed[0]);
}
```

然后是判断语句，判断语句可能有`else`部分，也可能没有，这时候就需要用到`OptionParser`了，他的BNF为`if <BExp> then <Stmt> else <Stmt> end`：

`examples/slime/parser/stmt.js`
```javascript
/**
 * 获得判断语句AST
 */
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

/**
 * 判断语句
 */
function stmtIf() {
  // 这里就体现了链式调用的优越性
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
```

最后是循环语句，

`examples/slime/parser/stmt.js`
```javascript
/**
 * 循环语句AST
 */
function _processWhile(parsed) {
  // [[[[_, condition], _], body], _]
  return new WhileStmt(parsed[0][0][0][1], parsed[0][1]);
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
```

将上述的所有解析器用`or`连接，就可以构成`stmt`解析器了：

`examples/slime/parser/stmt.js`
```javascript
/**
 * stmt解析器
 */
function stmt() {
  return stmtAssign().or(stmtIf()).or(stmtWhile());
}
```

这样，整个Stmt解析器就完成了。

#### Slime解析器

我们将3种类型的解析器已经全部构成，细心的同学已经发现了，Stmt解析器中已经将AExp解析器和BExp的解析器连接了进来，而BExp解析器中也连接了AExp解析器，这就是根据BNF表示和组合子逻辑来构建解析器的好处，它们两者使得语法的推导十分自然和简单。

然后我们通过那个`PhraseParser`来包装整个Slime解析器：

`examples/slime/parser/index.js`
```javascript
/**
 * 语句组合解析器，这个解析器要求代码完整性，作为程序的入口
 */
function slimeParser() {
  return new PhraseParser(stmtList());
}
```

这里注意一下，我们没有使用`stmt`来当做整个Slime的解析器，转而使用了`stmtList`，其实`stmtList`代表的复合语句已经包含了普通的语句。

到这里为止，整个Slime语言的语法解析器就已经完成了。

## 0x05 Slime解释器

我们要在这一部分将上面的所有工作结合起来，很简单：

```javascript
/**
 * slime分词器
 */
class SlimeLexer extends Lexer {
  constructor() {
    super();
    this._addTokenExpression = this.addTokenExpression;
    this.addTokenExpression = undefined;
    for (let i = 0; i < tokenExprs.length; i += 1) {
      const tokenExpr = tokenExprs[i];
      this._addTokenExpression(tokenExpr[0], tokenExpr[1]);
    }
  }
}

const SlimeParser = slimeParser();
/**
 * slime解释器
 */
class Slime {
  constructor() {
    this.lexer = new SlimeLexer();
    this.parser = SlimeParser;
  }

  eval(code, env = {}) {
    // 词法分析
    const tokens = this.lexer.lex(code);
    // 语法分析
    const parseResult = this.parser.parse(tokens, 0);
    const ast = parseResult.value;
    // TODO: 语义分析
    // 执行
    const result = ast.eval(env);
    return {
      _tokens: tokens,
      result,
      env,
    };
  }
}
```

运行`slime.eval`会返回如下的结构：

```javascript
result = {
  _tokens: [ ... ], // token列表
  result: ..., // 整个程序运行的结果，一般是最后一个有值语句的值
  env: { ... }, // 大环境，包括所有变量
}
```

只要我们实例化一个`Slime`，然后执行`eval`并将代码字符串和大环境传入即可执行：

`test/slime/slime.js`
```javascript
const code = `n = 5;
p = 1;
while n > 0 do
  p = p * n;
  n = n - 1;
end`;

// ...

it('slime', (done) => {
  const slime = new Slime();
  const result = slime.eval(code);
  const env = result.env;
  expect(env.n).to.equal(0);
  expect(env.p).to.equal(120);
  done();
});
```

