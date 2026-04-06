export class ListenerRequiresContainerError extends Error {
  constructor(listenerName: string) {
    super(
      `Class listener "${listenerName}" requires a Dispatcher constructed with a ContainerResolutionContract.`,
    );
    this.name = "ListenerRequiresContainerError";
  }
}

export class ListenerMissingHandleError extends Error {
  constructor(listenerName: string) {
    super(`Listener "${listenerName}" must define a handle(event) method.`);
    this.name = "ListenerMissingHandleError";
  }
}
