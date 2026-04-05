import type { Binding } from "./binding-types.js";
import type { BindingBuilderContract } from "./types.js";

export class BindingBuilder<T = unknown> implements BindingBuilderContract<T> {
  constructor(private readonly binding: Binding<T>) {}

  tag(...tags: string[]): BindingBuilderContract<T> {
    this.binding.tags = [...(this.binding.tags ?? []), ...tags];
    return this;
  }
}
