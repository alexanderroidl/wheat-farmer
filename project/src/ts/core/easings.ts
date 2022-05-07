/**
 * Source: https://easings.net/
 */

export default class Easings {
  public static easeInQuad (x: number): number {
    return x * x;
  }

  public static easeInCubic (x: number): number {
    return x * x * x;
  }

  public static easeInOutQuart (x: number): number {
    return x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2;
  }

  public static easeInExpo (x: number): number {
    return x === 0 ? 0 : Math.pow(2, 10 * x - 10);
  }

  public static easeOutQuint (x: number): number {
    return 1 - Math.pow(1 - x, 5);
  }

  public static easeOutQuart (x: number): number {
    return 1 - Math.pow(1 - x, 4);
  }
}