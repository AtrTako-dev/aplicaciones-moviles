export class ErrorAmigable extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ErrorAmigable';
  }
}
