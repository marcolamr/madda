import { faker } from "@faker-js/faker";
import { User } from "../../app/Models/User.js";
import { getHashManagerOrThrow } from "../../bootstrap/hash-bridge.js";

type UserAttributes = {
  name: string;
  email: string;
  password: string;
  email_verified_at?: string | null;
  remember_token?: string | null;
};

/**
 * Factory for the {@link User} model.
 *
 * Usage:
 * ```ts
 * // single instance (not persisted)
 * const data = UserFactory.definition();
 *
 * // single persisted model
 * const user = await UserFactory.create();
 *
 * // with overrides
 * const admin = await UserFactory.create({ name: 'Admin', email: 'admin@example.com' });
 *
 * // many at once
 * const users = await UserFactory.createMany(10);
 *
 * // custom hasher — default uses `HashManager` from published `config/hashing.ts`
 * await UserFactory.create({}, { hashPassword: myHash });
 * ```
 */
export type UserFactoryPersistOptions = {
  /** Override default hashing from the app's `HashManager` (requires published hashing config). */
  hashPassword?: (plain: string) => Promise<string>;
};

export const UserFactory = {
  /** Return a plain-object definition with realistic fake data. */
  definition(overrides: Partial<UserAttributes> = {}): UserAttributes {
    return {
      name: faker.person.fullName(),
      email: faker.internet.email().toLowerCase(),
      password: faker.internet.password({ length: 16 }),
      email_verified_at: new Date().toISOString(),
      remember_token: null,
      ...overrides,
    };
  },

  /** Persist a single User and return the model instance. */
  async create(
    overrides: Partial<UserAttributes> = {},
    options?: UserFactoryPersistOptions,
  ): Promise<User> {
    const def = this.definition(overrides);
    const hashFn =
      options?.hashPassword ??
      ((plain: string) => getHashManagerOrThrow().make(plain));
    return User.create({ ...def, password: await hashFn(def.password) });
  },

  /** Persist `count` users and return all instances. */
  async createMany(
    count: number,
    overrides: Partial<UserAttributes> = {},
    options?: UserFactoryPersistOptions,
  ): Promise<User[]> {
    return Promise.all(
      Array.from({ length: count }, () => this.create(overrides, options)),
    );
  },
};
