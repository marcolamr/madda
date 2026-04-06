/**
 * Thrown by {@link Collection.firstOrFail}, {@link Collection.sole}, etc.
 * Mirrors `Illuminate\Support\ItemNotFoundException`.
 */
export class ItemNotFoundException extends Error {
  readonly name = "ItemNotFoundException";

  constructor(message = "Item not found.") {
    super(message);
  }
}

/**
 * Thrown when {@link Collection.sole} matches more than one item.
 * Mirrors `Illuminate\Support\MultipleItemsFoundException`.
 */
export class MultipleItemsFoundException extends Error {
  readonly name = "MultipleItemsFoundException";

  constructor(message = "Multiple items found.") {
    super(message);
  }
}
