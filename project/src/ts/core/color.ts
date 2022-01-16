import Util from "./util";

export default class Color {
  private static readonly REGEXP_RGB_COLORS_FROM_HEX = new RegExp(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);

  private _r: number;
  private _g: number;
  private _b: number;

  public get r (): number {
    return this._r;
  }

  public get g (): number {
    return this._g;
  }

  public get b (): number {
    return this._b;
  }

  constructor (r: number, g: number, b: number) {
    this._r = r;
    this._g = g;
    this._b = b;
  }

  public toHex (): string {
    let rs = this.r.toString(16);
    let gs = this.g.toString(16);
    let bs = this.b.toString(16);
  
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

  public static fromHex (hex: string): Color | null {
    const colorsResult = Color.REGEXP_RGB_COLORS_FROM_HEX.exec(hex);

    if (colorsResult) {
      return new Color(
        parseInt(colorsResult[1], 16),
        parseInt(colorsResult[2], 16),
        parseInt(colorsResult[3], 16)
      );
    }

    return null;
  }

  public mix (color: Color, percent: number): Color {
    const r = Math.round(Util.mix(this.r, color.r, percent));
    const g = Math.round(Util.mix(this.g, color.g, percent));
    const b = Math.round(Util.mix(this.b, color.b, percent));
  
    return new Color(r, g, b);
  }

  public lightenDarken (amount: number): Color | null {
    return new Color(
      this.r + amount,
      this.g + amount,
      this.b + amount
    );
  }
}