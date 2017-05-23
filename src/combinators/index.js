import ReservedParser from './reservedParser';
import TagParser from './tagParser';
import OptionParser from './optionParser';
import RepeatParser from './repeatParser';
import LazyParser from './lazyParser';
import PhraseParser from './phraseParser';
import {
  ConcatParser,
  AlternateParser,
  ProcessParser,
  ExpressionParser,
} from './parser';

export {
  // 基础分析器
  ConcatParser,
  AlternateParser,
  ProcessParser,
  ExpressionParser,
  ReservedParser,
  // 独立分析器
  TagParser,
  OptionParser,
  RepeatParser,
  LazyParser,
  PhraseParser,
};
