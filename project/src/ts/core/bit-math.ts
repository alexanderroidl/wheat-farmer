export default class BitMath {
  public static floor (n: number): number {
    return n << 0;
  }
    
  public static round (n: number): number {
    return (0.5 + n) << 0;
  }
  
  public static abs (n: number): number {
    return (n ^ (n >> 31)) - (n >> 31);
  }

  public static isInt (value: string | number): boolean {
    const parsed = typeof value === "string" ? parseFloat(value) : value;
    return !isNaN(parsed) && (parsed | 0) === parsed;
  }
}