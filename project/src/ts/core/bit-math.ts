export default class BitMath {
  /**
   * Floors a number
   * @param {number} n
   * @returns {number}
   */
  public static floor (n: number): number {
    return n + (n < 0 && !Number.isInteger(n) ? -1 : 0) >> 0;
  }

  /**
   * Rounds a number
   * @param {number} n
   * @returns {number}
   */
  public static round (n: number): number {
    return (((n + 0.5) << 1) >> 1);
  }

  /**
   * Ceils a number
   * @param {number} n
   * @returns {number}
   */
  public static ceil (n: number): number {
    return n + (n < 0 ? 0 : 1) >> 0;
  }

  /**
   * Gets absolute value of a number
   * @param {number} n Must be an integer. Floats are not supported
   * @returns {number}
   */
  public static abs (n: number): number {
    return (n ^ (n >> 31)) - (n >> 31);
  }

  /**
   * Validate whether value is an integer
   * @param {string|number} value
   * @returns {boolean}
   */
  public static isInt (value: string | number): boolean {
    const parsed = typeof value === "string" ? parseFloat(value) : value;
    return !isNaN(parsed) && (parsed | 0) === parsed;
  }
}