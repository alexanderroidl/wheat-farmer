export default class Util {
  private static alphaNumericRegExp = new RegExp("[\\w ]+");

  public static isAlphaNumeric (text: string): boolean {
    return Util.alphaNumericRegExp.test(text);
  }

  public static leadZeros (value: number | string, size: number): number | string {
    value = value.toString();

    while (value.length < size) {
      value = "0" + value;
    }
    return value;
  }

  public static mixColors (color1: string, color2: string, percent: number): string {
    const red1 = parseInt(color1[1] + color1[2], 16);
    const green1 = parseInt(color1[3] + color1[4], 16);
    const blue1 = parseInt(color1[5] + color1[6], 16);
  
    const red2 = parseInt(color2[1] + color2[2], 16);
    const green2 = parseInt(color2[3] + color2[4], 16);
    const blue2 = parseInt(color2[5] + color2[6], 16);
  
    const red = Math.round(Util.mix(red1, red2, percent));
    const green = Math.round(Util.mix(green1, green2, percent));
    const blue = Math.round(Util.mix(blue1, blue2, percent));
  
    return Util.generateHexFromRGB(red, green, blue);
  }
  
  private static generateHexFromRGB (r: number, g: number, b: number) {
    let rs = r.toString(16);
    let gs = g.toString(16);
    let bs = b.toString(16);
  
    while (rs.length < 2) {
      rs = "0" + rs;
    }
    
    while (gs.length < 2) {
      gs = "0" + gs;
    }

    while (bs.length < 2) {
      bs = "0" + bs;
    }
  
    return "#" + rs + gs + bs;
  }
  
  private static mix (start: number, end: number, percent: number) {
    return start + ((percent) * (end - start));
  }

  public static lightenDarkenColor (color: string, amount: number): string {
    let usePound = false;

    if (color[0] === "#") {
      color = color.slice(1);
      usePound = true;
    }

    const num = parseInt(color, 16);

    let r = (num >> 16) + amount;

    if (r > 255) r = 255;
    else if (r < 0) r = 0;

    let b = ((num >> 8) & 0x00FF) + amount;

    if (b > 255) b = 255;
    else if (b < 0) b = 0;

    let g = (num & 0x0000FF) + amount;

    if (g > 255) g = 255;
    else if (g < 0) g = 0;

    return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16);
  }
}