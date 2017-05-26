export default class Equality {
  constructor() {
    this.valueOf = this.toString;
  }
  equal(other) {
    if (this === other) return true;
    return this.toString() === other.toString();
  }
}
