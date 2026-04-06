export type ArgumentDefinition = {
  name: string;
  required: boolean;
  defaultValue?: string;
  description?: string;
  isArray: boolean;
};

export type OptionDefinition = {
  name: string;
  acceptsValue: boolean;
  defaultValue?: string;
  description?: string;
  isArray: boolean;
};

export type ParsedSignature = {
  name: string;
  arguments: ArgumentDefinition[];
  options: OptionDefinition[];
};

/**
 * Parses an Artisan-style signature string.
 *
 * Supported syntax:
 *   command:name {arg} {arg?} {arg=default} {arg* : description}
 *                {--flag} {--option=} {--option=default}
 */
export function parseSignature(signature: string): ParsedSignature {
  // Tokenise: grab the command name then every {...} block
  const tokens = signature.trim().match(/[^\s{}]+|\{[^{}]*\}/g) ?? [];
  const name = tokens[0] ?? "";
  const args: ArgumentDefinition[] = [];
  const opts: OptionDefinition[] = [];

  for (const token of tokens.slice(1)) {
    if (!token.startsWith("{") || !token.endsWith("}")) continue;

    const inner = token.slice(1, -1).trim();

    // Split off inline description:  {arg : The argument description}
    const descSep = inner.indexOf(" : ");
    const description =
      descSep !== -1 ? inner.slice(descSep + 3).trim() : undefined;
    const def = descSep !== -1 ? inner.slice(0, descSep).trim() : inner;

    if (def.startsWith("--")) {
      // ---- OPTION -------------------------------------------------------
      const raw = def.slice(2);
      const eqIdx = raw.indexOf("=");

      if (eqIdx !== -1) {
        const rawName = raw.slice(0, eqIdx);
        const isArray = rawName.endsWith("[]");
        const optName = isArray ? rawName.slice(0, -2) : rawName;
        const defaultValue = raw.slice(eqIdx + 1) || undefined;
        opts.push({ name: optName, acceptsValue: true, defaultValue, description, isArray });
      } else {
        const isArray = raw.endsWith("[]");
        const optName = isArray ? raw.slice(0, -2) : raw;
        opts.push({ name: optName, acceptsValue: false, description, isArray });
      }
    } else {
      // ---- ARGUMENT -----------------------------------------------------
      const isArray = def.endsWith("*") || def.endsWith("[]");
      const stripped = def.replace(/\*$/, "").replace(/\[\]$/, "");
      const eqIdx = stripped.indexOf("=");

      if (eqIdx !== -1) {
        const argName = stripped.slice(0, eqIdx);
        const defaultValue = stripped.slice(eqIdx + 1);
        args.push({ name: argName, required: false, defaultValue, description, isArray });
      } else if (stripped.endsWith("?")) {
        args.push({ name: stripped.slice(0, -1), required: false, description, isArray });
      } else {
        args.push({ name: stripped, required: true, description, isArray });
      }
    }
  }

  return { name, arguments: args, options: opts };
}
