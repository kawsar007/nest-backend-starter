import * as bcrypt from 'bcrypt';

/**
 * Hashing utility functions for passwords and sensitive tokens.
 */
export class HashUtil {
  /**
   * Hash a plain-text value using bcrypt.
   * @param value - The value to hash
   * @param saltRounds - Number of bcrypt salt rounds (default 12)
   */
  static async hash(value: string, saltRounds: number = 12): Promise<string> {
    return bcrypt.hash(value, saltRounds);
  }

  /**
   * Compare a plain-text value against a bcrypt hash.
   * @param value - Plain text to compare
   * @param hash - The stored bcrypt hash
   */
  static async compare(value: string, hash: string): Promise<boolean> {
    return bcrypt.compare(value, hash);
  }
}
