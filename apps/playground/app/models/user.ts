import { Model } from "@madda/database";

/**
 * User model.
 *
 * @see {@link https://github.com/laravel/laravel/blob/13.x/app/Models/User.php Laravel reference}
 */
export class User extends Model {
  protected table = "users";
  protected primaryKey = "id";
  protected timestamps = true;

  get name(): string {
    return this.getAttribute("name");
  }

  get email(): string {
    return this.getAttribute("email");
  }

  get emailVerifiedAt(): string | null {
    return this.getAttribute("email_verified_at") ?? null;
  }

  /** Never expose the raw password outside the model. */
  get createdAt(): string | null {
    return this.getAttribute("created_at") ?? null;
  }

  get updatedAt(): string | null {
    return this.getAttribute("updated_at") ?? null;
  }

  toJSON(): Record<string, unknown> {
    const attrs = this.getAttributes();
    // hide sensitive fields from serialisation
    const { password: _password, remember_token: _token, ...safe } = attrs;
    return safe;
  }
}
