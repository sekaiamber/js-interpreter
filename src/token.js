export default class Token {
  constructor(value, tag) {
    this.value = value;
    this.tag = tag;
  }

  toString() {
    return `Token(${this.value}, ${this.tag})`;
  }
}
