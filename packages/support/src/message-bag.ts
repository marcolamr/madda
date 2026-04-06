/** Validation-style keyed messages — Laravel `MessageBag`. */
export class MessageBag {
  constructor(private messages: Record<string, string[]> = {}) {}

  add(key: string, message: string): this {
    const list = this.messages[key] ?? [];
    list.push(message);
    this.messages[key] = list;
    return this;
  }

  merge(other: MessageBag): this {
    for (const [k, v] of Object.entries(other.getMessages())) {
      this.messages[k] = [...(this.messages[k] ?? []), ...v];
    }
    return this;
  }

  getMessages(): Record<string, string[]> {
    return { ...this.messages };
  }

  get(key?: string): string | Record<string, string[]> {
    if (key === undefined) {
      return this.getMessages();
    }
    const list = this.messages[key];
    return list ? list.join("\n") : "";
  }

  first(key?: string): string | undefined {
    if (key !== undefined) {
      return this.messages[key]?.[0];
    }
    for (const msgs of Object.values(this.messages)) {
      if (msgs[0]) return msgs[0];
    }
    return undefined;
  }

  has(key?: string): boolean {
    if (key === undefined) {
      return Object.keys(this.messages).length > 0;
    }
    return (this.messages[key]?.length ?? 0) > 0;
  }

  any(): boolean {
    return this.has();
  }

  isEmpty(): boolean {
    return !this.any();
  }
}
