export default class Equality {
  equal(other) {
    if (this === other) return true;
    return this.toString() === other.toString();
  }
}
