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

我想找一个简答的语言来作为这个项目的第一个实例。所以我搞了一个很简单的语言。

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
  <Stmt> ::= Id = <AExp>
          |  <Stmt>; <Stmt>
          |  if <BExp> then <Stmt> else <Stmt> end
          |  while <BExp> do <Stmt> end
   <Pgm> ::= intList{Id}; Stmt
```

麻雀虽小五脏俱全，让我们来研读一下Slime语言的BNF，它指出，Slime只有一种数据类型就是正整数类型，Slime拥有变量ID。

Slime拥有两种类型的表达式：`AExp`(代数表达式)和`BExp`(布尔表达式)。其中`AExp`包含数字类型和变量的引用以及四则运算。

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
x = 1
not y # 与或非逻辑
1 < 2 or 2 < 3
1 < 2 and 2 < 3
```

Slime包含一系列`Stmt`语句，这部分语句用来控制程序运行：

```ruby
x := 1 # 赋值
x := 1; y := 2 # 复合语句
# 判断
if 1 < 2 then
  x := 2
else
  x := 3
end
# 循环
while 1 < 2 do
  x := x + 1
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
  // 分割和注释
  [/^[ \n\t]+/, NONE],
  [/^#[^\n]*/, NONE],
  // 赋值、优先级和代码块
  [/^:=/, RESERVED],
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
  [/^=/, RESERVED],
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
  // 变量
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
const tokens = lexer.lex('a := 1');
console.log(tokens);
// [
//   Token{ value: 'a', tag: 2 },
//   Token{ value: ':=', tag: 1 },
//   Token{ value: '1', tag: 3 }
// ]
```

更多关于Lexer的测试可以参照`test/slime/lexer.js`。

## 0x03 语法解析器 - 解析器组合子

语法解析器部分，是整个解释器的核心，它的功能是消费Token列表并输出抽象语法树AST。

### 什么是抽象语法树AST

树，就是一种数据结构，大家都懂的。

在编译器和解释器中，它们一般会把Token序列转化为更易理解的分析树(parse tree)或者语法树(syntax tree)。

例如某段程序就一行代码，就是赋值：`a := 1`。

让我们来看看这段程序的分析树大概长这样：

```
    <Program>
        |
    <Assign>
     /  |  \
 <ID>  ':=' <Number>
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

语法树忽略了源代码上许多细节，将本质抽象出来，例如在这里我们忽略了`:=`，更多的时候，例如在描述代数表达式的时候，语法树比分析树更加具有优势，因为他会忽略`(`和`)`等符号，并且将运算优先级表现在树上。

所以通过上面的说明，**分析树也被叫做具体语法树(concrete syntax tree, CST)，而语法树则被称为抽象语法树(AST)**。

很多时候，编译器和解释器将直接生成AST，也有情况是它们先生成CST再在基础上生成AST，也有很多时候它们是互相缠绕在一起，生成一些类似的东西。

### 什么是解析器组合子

编写语法解析器有好多方法，使用解析器组合子大概是最简单最优雅的一种了。

解析器组合子事实上来源于函数式编程，它实际上是一个**高阶函数**，这意味着它需要输入一个或几个函数，然后再输出一个函数，放到我们这儿，也就是说解析器组合子将输入一个或几个解析器然后输出一个新的解析器。

在JavaScript中，我们可以简单地把组合子也看成一种解析器，然后把组合过程当成所有解析器中都继承的函数。解析器组合子明显的一个好处是，因为它脱胎于函数式编程，所以表现在JavaScript上，可以很方便的做到**链式调用**。

我将编写一个最最简单基础的解析器组合子库，用这些基础组合子来拼出一些稍微复杂的组合子，最后针对Slime语言构建出它的语法解析器。

先做基础组合子，也是因为组合子逻辑跟实际语法无关，基础的组合子可以用到任何语言上。

### 基础组合子

在写基础组合子之前，我们要做点额外的工作。

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

这个基类拥有5个接口，其中`concat`、`or`、`do`、`join`分别是组合子逻辑的实现函数，在下面会一一实现这些解析器，`parse`函数是消费Token的入口，它将返回解析的结果。

然后我们来定义一下`Result`类，这个类没其他作用，只是一个`Parser.parse`函数调用以后的结果的包装，如果正确解析的话，这个函数将返回包装了解析结果和Token序列索引的一个`Result`。
