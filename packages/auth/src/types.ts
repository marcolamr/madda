export type AuthenticatedUser = Record<string, unknown> & { id: string };

export type AuthVia = "session" | "api_token";

export type UserProvider = {
  loadById(id: string): Promise<AuthenticatedUser | null>;
};
