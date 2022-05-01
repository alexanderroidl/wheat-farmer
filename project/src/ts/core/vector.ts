import BitMath from "./bit-math";

export default class Vector {
  public x: number;
  public y: number;

  /**
     * Retrieve total length
     *
     * @returns Total length
     */
  public get length (): number {
    return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
  }

  /**
     * Constructor
     *
     * @param x - Initial x coordinate
     * @param y - Initial y coordinate
     */
  constructor (x: number | Vector, y?: number) {
    if (x instanceof Vector) {
      this.x = x.x;
      this.y = x.y;
    } else {
      this.x = x;
      this.y = y ?? x;
    }
  }

  /**
     * Add to coordinates
     *
     * @param x - Added to x coordinate
     * @param y - Added to y coordinate
     * @returns Vector with added coordinates
     */
  public add (x: number | Vector, y?: number): Vector {
    if (x instanceof Vector) {
      return new Vector(this.x + x.x, this.y + x.y);
    }
    return new Vector(this.x + x, this.y + (y != null ? y : x));
  }

  public substract (x: number | Vector, y?: number): Vector {
    if (x instanceof Vector) {
      return new Vector(this.x - x.x, this.y - x.y);
    }
    return new Vector(this.x - x, this.y - (y != null ? y : x));
  }

  /**
     * Floor coordinates
     *
     * @returns Vector with floored coordinates
     */
  public floor (): Vector {
    return new Vector(BitMath.floor(this.x), BitMath.floor(this.y));
  }

  /**
     * Round coordinates
     *
     * @returns Vector with rounded coordinates
     */
  public round (): Vector {
    return new Vector(BitMath.round(this.x), BitMath.round(this.y));
  }

  /**
     * Ceil coordinates
     *
     * @returns Vector with ceiled coordinates
     */
  public ceil (): Vector {
    return new Vector(BitMath.ceil(this.x), BitMath.ceil(this.y));
  }

  public multiply (x: number | Vector, y?: number): Vector {
    if (x instanceof Vector) {
      return new Vector(this.x * x.x, this.y * x.y);
    }
    return new Vector(this.x * x, this.y * (y != null ? y : x));
  }

  public divide (x: number | Vector, y?: number): Vector {
    if (x instanceof Vector) {
      return new Vector(this.x / x.x, this.y / x.y);
    }
    return new Vector(this.x / x, this.y / (y != null ? y : x));
  }

  public abs (): Vector {
    return new Vector(Math.abs(this.x), Math.abs(this.y));
  }

  /**
     * Rotate clockwise by degrees
     *
     * @param deg - Angle in degrees
     * @returns Rotated vector
     */
  public rotate (rad: number): Vector {
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    return new Vector(
      BitMath.round(10000 * (this.x * cos - this.y * sin)) / 10000,
      BitMath.round(10000 * (this.x * sin + this.y * cos)) / 10000
    );
  }

  public rotateDeg (deg: number): Vector {
    const rad = -deg * (Math.PI / 180);
    return this.rotate(rad);
  }

  public toString (): string {
    return `(${this.x.toFixed(1)}, ${this.y.toFixed(1)})`;
  }
}