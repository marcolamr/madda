/**
 * Laravel `config/hashing.php` shape (see {@link https://laravel.com/docs/13.x/hashing}).
 * Default driver in Madda-published stubs is `argon2id` (Laravel defaults to `bcrypt`).
 */
export type HashDriver = "bcrypt" | "argon" | "argon2id";

export type HashingConfig = {
  driver: HashDriver;
  bcrypt: {
    rounds: number;
    verify: boolean;
    limit: number | null;
  };
  argon: {
    memory: number;
    threads: number;
    time: number;
    verify: boolean;
  };
  rehash_on_login: boolean;
};
