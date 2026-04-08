import { config } from "@madda/eslint-config/base";

/** Scaffold templates use Vite `import.meta.env.*`; not monorepo turbo env. */
export default [
  ...config,
  {
    files: ["templates/**/*.{ts,tsx}"],
    rules: {
      "turbo/no-undeclared-env-vars": "off",
    },
  },
];
