export default class Vector {
    public x: number;
    public y: number;

    get length (): number {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    }

    constructor (x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    public add (x: number, y: number): Vector {
        return new Vector(this.x + x, this.y + y)
    }

    public floor (): Vector {
        return new Vector(Math.floor(this.x), Math.floor(this.y));
    }
}