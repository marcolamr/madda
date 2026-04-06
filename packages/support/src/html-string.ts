/**
 * Marks content as intentionally HTML — same idea as Laravel `HtmlString`
 * (frameworks can choose not to escape this in templates).
 */
export class HtmlString {
  constructor(private readonly html: string) {}

  toString(): string {
    return this.html;
  }

  toHtmlString(): string {
    return this.html;
  }

  isEmpty(): boolean {
    return this.html === "";
  }
}
