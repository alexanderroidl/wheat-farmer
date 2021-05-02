export default class Util {
  public static leadZeros (value: number | string, size: number): number | string {
    value = value.toString();

    while (value.length < size) {
      value = '0' + value;
    }
    return value;
  }

  public static mixColors (color1: string, color2: string, percent: number) {
    var red1 = parseInt(color1[1] + color1[2], 16);
    var green1 = parseInt(color1[3] + color1[4], 16);
    var blue1 = parseInt(color1[5] + color1[6], 16);
  
    var red2 = parseInt(color2[1] + color2[2], 16);
    var green2 = parseInt(color2[3] + color2[4], 16);
    var blue2 = parseInt(color2[5] + color2[6], 16);
  
    var red = Math.round(Util.mix(red1, red2, percent));
    var green = Math.round(Util.mix(green1, green2, percent));
    var blue = Math.round(Util.mix(blue1, blue2, percent));
  
    return Util.generateHexFromRGB(red, green, blue);
  }
  
  private static generateHexFromRGB (r: number, g: number, b: number) {
    let rs = r.toString(16);
    let gs = g.toString(16);
    let bs = b.toString(16);
  
    while (rs.length < 2) { rs = "0" + rs; }
    while (gs.length < 2) { gs = "0" + gs; }
    while (bs.length < 2) { bs = "0" + bs; }
  
    return "#" + rs + gs + bs;
  }
  
  private static mix (start: number, end: number, percent: number) {
      return start + ((percent) * (end - start));
  }
}