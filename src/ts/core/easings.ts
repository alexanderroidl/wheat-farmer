/**
 * Source: https://easings.net/
 */

export default class Easings {
    public static easeInCubic(x: number): number {
        return x * x * x;
    }

    public static easeInOutQuart (x: number): number {
        return x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2;
    }
}