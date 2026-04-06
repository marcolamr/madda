export class CommandNotRegisteredError extends Error {
  constructor(commandName: string) {
    super(`No handler registered for command "${commandName}".`);
    this.name = "CommandNotRegisteredError";
  }
}

export class CommandHandlerInvalidError extends Error {
  constructor(handlerName: string) {
    super(`Handler "${handlerName}" must define handle(command) returning a value.`);
    this.name = "CommandHandlerInvalidError";
  }
}

export class HandlerMissingHandlesMetadataError extends Error {
  constructor(handlerName: string) {
    super(
      `Handler "${handlerName}" is missing @Handles(Command) metadata. Use bus.register(Command, Handler) or add @Handles.`,
    );
    this.name = "HandlerMissingHandlesMetadataError";
  }
}
