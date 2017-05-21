const NONE = 0x00;
const RESERVED = 0x01;
const ID = 0x01;
const NUMBER = 0x02;

const tokenExprs = [
  [/^[ \n\t]+/, NONE],
  [/^#[^\n]*/, NONE],
  [/^:=/, RESERVED],
  [/^\(/, RESERVED],
  [/^\)/, RESERVED],
  [/^;/, RESERVED],
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
  [/^if/, RESERVED],
  [/^then/, RESERVED],
  [/^else/, RESERVED],
  [/^while/, RESERVED],
  [/^do/, RESERVED],
  [/^end/, RESERVED],
  [/^[0-9]+/, NUMBER],
  [/^[A-Za-z][A-Za-z0-9_]*/, ID],
];

export default tokenExprs;
