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

我想找一个简答的语言来作为这个项目的第一个实例。所以我搞了一个很简单的语言，它叫做Sllime（史莱姆，RPG游戏中最低级的怪）。

这个语言是专属于本文的毫无用处的语言，结构十分简单，通过文章描述，可以得知Slime简直就是一种最最基础的编程语言：
* 拥有顺序、判断、循环3种基本结构
* 没有函数、类等高级功能
* 全部变量，没有作用域
* 只有整形，没有其他类型

Slime的BNF表示如下：

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

麻雀虽小五脏俱全，让我们来研读一下Slime语言的BNF，它指出，Slime只有一种数据类型就是正整数类型，Slime拥有变量ID。

Slime拥有两种类型的表达式：`AExp`(代数表达式)和`BExp`(布尔表达式)。其中`AExp`包含数字类型和变量的引用以及四则运算。Slime的语法类似`Ruby`的语法：

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
x = 1 # 赋值
x = 1; y = 2 # 复合语句
# 判断
if 1 < 2 then
  x = 2
else
  x = 3
end
# 循环
while 1 < 2 do
  x = x + 1
end
```

整个Slime程序其实就是一个巨大的`Stmt`，以及一个全局变量字典`intList{Id}`。

以上就是Slime语言的所有语法。

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

## 0x03 语法解析器 - 解析器组合子

语法解析器部分，是整个解释器的核心，它的功能是消费Token列表并输出抽象语法树AST。从代码行为上来看，一个解析器能识别出特定语法的语句，例如赋值解析器可以解析`a = 1`，而无法解析`a + 1`。

**注意：从这章开始，所有不是代码块的代码，或者说所有行内代码，都可能是伪代码，无法直接执行，只是表明意思。但是所有代码块的代码均是从项目中复制出来的，并且标示了源文件的目录地址。**

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

举个栗子，假设我们有关键字解析器，能解析`+`这个关键字字符，又有常量解析器，能解析`1`或者`2`这样的常量。那么若是要解析`1 + 2`这样的常量加法语句，就可以用`常量解析器.concat(关键字解析器(+)).concat(常量解析器)`来获得这个变量赋值语句的解析器。

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

要仔细体会一下这个解析器和`AlternateParser`的区别，前者只接受一个解析器，后者接收两个，前者其实是一种占位措施，表示匹配元素**可能没有**，所以永远是解析成功的，而后者表示两者中有一个，否则解析失败。

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
