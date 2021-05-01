import World from "./world";
import Camera from "./camera";
import EmptyTile from "../tiles/empty";

export default class Renderer {
    public readonly FONT_SIZE = 12;
    public readonly SQUARE_SIZE = 32;

    private _canvas: HTMLCanvasElement = document.createElement('canvas');
    public readonly camera: Camera;

    private _mouseX: number = 0;
    private _mouseY: number = 0;

    set mouseX (x: number) {
        this._mouseX = x;
    }

    set mouseY (y: number) {
        this._mouseY = y;
    }

    get width () {
        return this._canvas.width;
    }

    get height () {
        return this._canvas.height;
    }

    constructor () {
        this.setupCanvas();
        this.camera = new Camera(this.SQUARE_SIZE);
    }

    private setupCanvas (): void {
        this.setToWindowSize();

        window.addEventListener('load', (e) => {
            this.setToWindowSize();
        });

        window.addEventListener('resize', (e) => {
            this.setToWindowSize();
        });

        document.body.append(this._canvas);
    }

    private setToWindowSize (): void {
        this._canvas.width = window.innerWidth;
        this._canvas.height = window.innerHeight;
    }

    private paintSquare (ctx: any, x: number, y: number, fillStyle: string, opacity: number = 1, char?: string, charColor?: string): void {
        const zoom = this.camera.zoomAmount;

        ctx.globalAlpha = opacity;
        ctx.fillStyle = fillStyle;
        ctx.fillRect(
            this.SQUARE_SIZE * x * zoom - this.camera.x, 
            this.SQUARE_SIZE * y * zoom - this.camera.y, 
            this.SQUARE_SIZE * zoom, 
            this.SQUARE_SIZE * zoom
        );

        if (char) {
            const charFillStyle = charColor ? charColor : 'white';

            ctx.font = `${Math.floor(this.FONT_SIZE * zoom)}px "Courier New"`;
            ctx.fillStyle = charFillStyle;
            ctx.textAlign = "center";

            ctx.fillText(
                char, 
                this.SQUARE_SIZE * x * zoom + this.SQUARE_SIZE / 2 * zoom - this.camera.x, 
                this.SQUARE_SIZE * y * zoom + this.SQUARE_SIZE / 2 * zoom - this.camera.y
            ); 
        }

    }

    public render (world: World): void {
        const ctx = this._canvas.getContext('2d');
        if (!ctx) {
            return;
        }

        const mouseWorldPos = this.camera.worldPosFromScreen(this._mouseX, this._mouseY);

        ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);

        const xStart = Math.floor((this.camera.x % this.SQUARE_SIZE - (window.innerWidth / this.SQUARE_SIZE)) / this.camera.zoomAmount);
        const yStart = Math.floor((this.camera.y % this.SQUARE_SIZE - (window.innerWidth / this.SQUARE_SIZE)) / this.camera.zoomAmount);
        const xEnd = Math.ceil(window.innerWidth / this.SQUARE_SIZE / this.camera.zoomAmount);
        const yEnd = Math.ceil(window.innerHeight / this.SQUARE_SIZE / this.camera.zoomAmount);
        for (let y = yStart; y < yEnd; y++) {
            for (let x = xStart; x < xEnd; x++) {
                this.paintSquare(ctx, x, y, '#ebb434');
            }
        }

        for (let y = 0; y < world.tiles.length; y++) {
            for (let x = 0; x < world.tiles[y].length; x++) {
                ctx.globalAlpha = 1;

                const tile = world.tiles[y][x];
                this.paintSquare(ctx, x, y, tile.getHexColor(), 1, tile.getChar(), tile.getCharColor());

                if (Math.floor(mouseWorldPos.x) === x && Math.floor(mouseWorldPos.y)  === y) {
                    this.paintSquare(ctx, x, y, 'white', 0.5);
                }
            }
        }
    }
}