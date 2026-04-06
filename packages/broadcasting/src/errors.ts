export class BroadcastInfrastructureError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BroadcastInfrastructureError";
  }
}
