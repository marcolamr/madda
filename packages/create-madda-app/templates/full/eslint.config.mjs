import { config as base } from "@madda/eslint-config/base";
import { config as reactInternal } from "@madda/eslint-config/react-internal";

const baseIgnoringWeb = base.map((block) => ({
  ...block,
  ignores: [...(Array.isArray(block.ignores) ? block.ignores : []), "web/**"],
}));

const webReact = reactInternal.map((block) => ({
  ...block,
  files: ["web/**/*.ts", "web/**/*.tsx"],
}));

export default [...baseIgnoringWeb, ...webReact];
