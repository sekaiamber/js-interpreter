export default class Result {
  constructor(value, pos) {
    this.value = value;
    this.pos = pos;
  }

  toString() {
    return `Result(${this.value}, ${this.pos})`;
  }
}
