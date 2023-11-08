export abstract class BaseDataIntegrityStrategy<T> {
  public args: T

  constructor(args: T) {
    this.args = args
  }
}
