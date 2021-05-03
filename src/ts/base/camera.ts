import Vector from "../core/vector";

export default class Camera {
    public readonly DEFAULT_ZOOM = 1;

    private _position: Vector = new Vector(0, 0);
    private _zoomAmount: number = this.DEFAULT_ZOOM;
    private _worldSquareSize: number;

    get position (): Vector {
        return this._position;
    }

    get zoomAmount (): number {
        return this._zoomAmount;
    }

    get worldSquareSize (): number {
        return this._worldSquareSize;
    }

    constructor (worldSquareSize: number) {
        this._worldSquareSize = worldSquareSize;
    }

    public setup (worldSize: number): void {
        const renderedWorldSize = worldSize * this._worldSquareSize * this._zoomAmount;

        this._position = new Vector(
            -window.innerWidth / 2 + renderedWorldSize / 2,
            -window.innerHeight / 2 + renderedWorldSize / 2
        );
    }

    public move (x: number, y: number): void {
        this._position = this._position.add(x, y);
    }

    public zoom (zoom: number): void {
        if (this._zoomAmount + zoom < 0) {
            this._zoomAmount = 0.1;
            return;
        }

        const halfWindowSize = new Vector(window.innerWidth / 2, window.innerHeight / 2);

        const oldPos = this.worldPosFromScreen(halfWindowSize);
        this._zoomAmount += zoom;

        const newPos = this.worldPosFromScreen(halfWindowSize);
        this.move(-(newPos.x - oldPos.x) *  this.worldSquareSize * this.zoomAmount, -(newPos.y - oldPos.y) *  this.worldSquareSize * this.zoomAmount);
    }

    public worldPosFromScreen (screenPos: Vector): Vector {
        return new Vector(
            (screenPos.x + this.position.x) / this.worldSquareSize / this._zoomAmount,
            (screenPos.y + this.position.y) / this.worldSquareSize / this._zoomAmount
        );
    }
}