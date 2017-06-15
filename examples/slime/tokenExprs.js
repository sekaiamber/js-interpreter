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

export default tokenExprs;
export {
  NONE,
  RESERVED,
  ID,
  NUMBER,
};
