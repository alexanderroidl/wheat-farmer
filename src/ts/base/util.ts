export default class Util {
  public static leadZeros (value: number | string, size: number): number | string {
    value = value.toString();

    while (value.length < size) {
      value = '0' + value;
    }
    return value;
  }
}