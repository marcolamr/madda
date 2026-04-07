import type { AuthenticatedUser, UserProvider } from "@madda/auth";
import { User } from "../models/user.js";

function toAuthUser(model: User): AuthenticatedUser {
  const json = model.toJSON();
  return {
    ...json,
    id: String(model.getAttribute<number | string>("id")),
  };
}

export const playgroundUserProvider: UserProvider = {
  async loadById(id: string) {
    const model = await User.find(id);
    if (!model) {
      return null;
    }
    return toAuthUser(model);
  },
};
