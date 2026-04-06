export type EmailAddress = string | { email: string; name?: string };

export function parseEmailAddress(input: EmailAddress): { email: string; name?: string } {
  if (typeof input !== "string") {
    return { email: input.email.trim(), name: input.name };
  }
  const trimmed = input.trim();
  const lt = trimmed.indexOf("<");
  const gt = trimmed.lastIndexOf(">");
  if (lt !== -1 && gt > lt) {
    const email = trimmed.slice(lt + 1, gt).trim();
    let name = trimmed.slice(0, lt).trim();
    if ((name.startsWith('"') && name.endsWith('"')) || (name.startsWith("'") && name.endsWith("'"))) {
      name = name.slice(1, -1).trim();
    }
    return name.length > 0 ? { email, name } : { email };
  }
  return { email: trimmed };
}

export function formatEmailAddress(input: EmailAddress): string {
  const { email, name } = parseEmailAddress(input);
  if (name && name.length > 0) {
    const safe = name.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    return `"${safe}" <${email}>`;
  }
  return email;
}

export function normalizeRecipientList(v: EmailAddress | EmailAddress[] | undefined): EmailAddress[] {
  if (v === undefined) {
    return [];
  }
  return Array.isArray(v) ? v : [v];
}
