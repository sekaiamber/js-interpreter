const baseCombinators = {
  concat: null,
};

class Parser {
  concat(other) {
    return new baseCombinators.concat(this, other);
  }
}

class ConcatParser extends Parser {
  constructor(left, right) {
    super();
    this.left = left;
    this.right = right;
  }

  getResult() {
    throw new Error('Cannot use base class Parser');
  }
}

baseCombinators.concat = ConcatParser;

export default Parser;
