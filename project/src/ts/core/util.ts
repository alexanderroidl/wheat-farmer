export default class Util {
  private static readonly REGEXP_ALPHA_NUMERIC = new RegExp(/[\w ]+/);

  public static isAlphaNumeric (text: string): boolean {
    return Util.REGEXP_ALPHA_NUMERIC.test(text);
  }

  public static leadZeros (value: number | string, size: number): number | string {
    value = value.toString();

    while (value.length < size) {
      value = "0" + value;
    }
    return value;
  }

  public static mix (start: number, end: number, percent: number): number {
    return start + ((percent) * (end - start));
  }
}