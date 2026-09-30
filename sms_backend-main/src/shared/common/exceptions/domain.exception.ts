export abstract class DomainException extends Error {
  protected constructor(
    message: string,
    public readonly httpStatus: number,
    public readonly code: string,
  ) {
    super(message);
    this.name = new.target.name;
  }
}
