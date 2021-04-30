export default class Camera {
    readonly DEFAULT_ZOOM = 1;

    private _x: number = 0;
    private _y: number = 0;
    private _zoomAmount: number = this.DEFAULT_ZOOM;
    private _worldSize?: number;
    private _worldSquareSize: number;

    get x () {
        return this._x;
    }

    get y () {
        return this._y;
    }

    get zoomAmount () {
        return this._zoomAmount;
    }

    get worldSquareSize () {
        return this._worldSquareSize;
    }

    constructor (worldSquareSize: number) {
        this._worldSquareSize = worldSquareSize;
    }

    setup (worldSize: number): void {
        this._worldSize = worldSize;
        const renderedWorldSize = worldSize * this._worldSquareSize * this._zoomAmount;

        this._x = -window.innerWidth / 2 + renderedWorldSize / 2;
        this._y = -window.innerHeight / 2 + renderedWorldSize / 2;
    }

    move (x: number, y: number): void {
        this._x += x ;
        this._y += y;
    }

    zoom (zoom: number): void {
        if (this._zoomAmount + zoom < 0) {
            this._zoomAmount = 0.1;
            return;
        }

        const w = window.innerWidth/2;
        const h = window.innerHeight/2;

        const oldPos = this.worldPosFromScreen(w, h);
        this._zoomAmount += zoom;

        const newPos = this.worldPosFromScreen(w, h);
        this.move(-(newPos.x - oldPos.x) *  this.worldSquareSize * this.zoomAmount, -(newPos.y - oldPos.y) *  this.worldSquareSize * this.zoomAmount);
    }

    worldPosFromScreen (x: number, y: number, round: boolean = false): { x: number, y: number } {
        const worldPos = {
            x: (x + this.x) / this.worldSquareSize / this._zoomAmount,
            y: (y + this.y) / this.worldSquareSize / this._zoomAmount
        };

        return {
            x: round ? Math.floor(worldPos.x) : worldPos.x,
            y: round ? Math.floor(worldPos.y) : worldPos.y
        }
    }
}