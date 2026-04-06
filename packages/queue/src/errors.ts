export class QueueMisconfiguredError extends Error {
  constructor(
    readonly connectionName: string,
    message: string,
  ) {
    super(`Queue "${connectionName}": ${message}`);
    this.name = "QueueMisconfiguredError";
  }
}

export class QueueConnectionNotFoundError extends Error {
  constructor(readonly connectionName: string) {
    super(`Queue connection not found: "${connectionName}"`);
    this.name = "QueueConnectionNotFoundError";
  }
}

export class UnknownJobTypeError extends Error {
  constructor(readonly jobType: string) {
    super(`No job handler registered for type "${jobType}"`);
    this.name = "UnknownJobTypeError";
  }
}

export class InvalidJobEnvelopeError extends Error {
  constructor(message = "Invalid serialized job envelope") {
    super(message);
    this.name = "InvalidJobEnvelopeError";
  }
}

export class QueueReserveNotSupportedError extends Error {
  constructor(readonly connectionName: string) {
    super(`Queue connection "${connectionName}" uses the sync driver and cannot reserve jobs`);
    this.name = "QueueReserveNotSupportedError";
  }
}
