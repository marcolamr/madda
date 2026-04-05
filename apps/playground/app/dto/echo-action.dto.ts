import type { DataTransferObject } from "@madda/core";

/**
 * Input DTO for the echo action — not a domain entity.
 */
export type EchoActionDto = DataTransferObject<{
  message: string;
}>;

export const echoActionRules = {
  message: "required|string|min:1|max:500",
} as const;
