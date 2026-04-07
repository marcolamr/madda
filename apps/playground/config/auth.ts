import type { AuthConfigShape } from "@madda/config";

const authConfig = {
  session: {},
  guard_order: ["session"],
} satisfies AuthConfigShape;

export default authConfig;
