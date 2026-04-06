import { Collection } from "./collection.js";

/**
 * Create a {@link Collection} from any iterable (Laravel `collect()` helper).
 */
export function collect<T>(items: Iterable<T> | ArrayLike<T> = []): Collection<T> {
  return new Collection(Array.from(items));
}
