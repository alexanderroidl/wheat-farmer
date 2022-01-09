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
    constructor (x: number, y: number) {
      this.x = x;
      this.y = y;
    }

    /**
     * Add to coordinates
     *
     * @param x - Added to x coordinate
     * @param y - Added to y coordinate
     * @returns Vector with added coordinates
     */
    public add (x: number, y: number): Vector {
      return new Vector(this.x + x, this.y + y);
    }

    /**
     * Round off coordinates
     *
     * @returns Vector with rounded off coordinates
     */
    public floor (): Vector {
      return new Vector(BitMath.floor(this.x), BitMath.floor(this.y));
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
        Math.round(10000 * (this.x * cos - this.y * sin)) / 10000,
        Math.round(10000 * (this.x * sin + this.y * cos)) / 10000
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