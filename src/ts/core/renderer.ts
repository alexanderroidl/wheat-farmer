import World from "../base/world";
import Camera from "../base/camera";
import EmptyTile from "../tiles/empty";
import Util from "./util";
import Vector from "./vector";

export default class Renderer {
    public readonly FONT_SIZE = 12;
    public readonly FONT_EMOJI_SIZE = 16;
    public readonly SQUARE_SIZE = 32;

    private _canvas: HTMLCanvasElement = document.createElement('canvas');
    public readonly camera: Camera;

    public mousePos: Vector = new Vector(0, 0);

    get width (): number {
        return this._canvas.width;
    }

    get height (): number {
        return this._canvas.height;
    }

    get z (): number {
        return this.camera.zoomAmount;
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

    public paintChar (ctx: CanvasRenderingContext2D, char: string, charColor: string, x: number, y: number, isHover: boolean): void {
        if (isHover) {
            ctx.shadowColor = "white";
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            ctx.shadowBlur = Math.floor(5 * this.z);
        }

        let fontSize = this.FONT_SIZE;
        let fontFamily = "Courier New";

        // Isn't alphanumeric -> must be emoji
        if (!Util.isAlphaNumeric(char)) {
            fontSize = this.FONT_EMOJI_SIZE;
            fontFamily = "OpenMoji";
        }

        const textDrawPos = new Vector(
            (this.SQUARE_SIZE * x + this.SQUARE_SIZE / 2) * this.z - this.camera.position.x,
            (this.SQUARE_SIZE * y + this.SQUARE_SIZE / 2) * this.z - this.camera.position.y
        );

        const fontDrawSize = Math.floor(fontSize * this.z);

        ctx.fillStyle = charColor;
        ctx.textAlign = "center";
        ctx.textBaseline = 'middle';
        ctx.font = `${fontDrawSize}px "${fontFamily}"`;
        ctx.fillText(char, Math.floor(textDrawPos.x), Math.floor(textDrawPos.y)); 

        ctx.shadowBlur = 0;
    }

    public paintSquare (ctx: CanvasRenderingContext2D, x: number, y: number, isHover: boolean, fillStyle: string, opacity: number = 1, char?: string | null, charColor?: string | null): void {
        const zoom = this.camera.zoomAmount;

        ctx.globalAlpha = opacity;
        ctx.fillStyle = fillStyle;
        ctx.fillRect(
            this.SQUARE_SIZE * x * zoom - this.camera.position.x, 
            this.SQUARE_SIZE * y * zoom - this.camera.position.y, 
            this.SQUARE_SIZE * zoom, 
            this.SQUARE_SIZE * zoom
        );

        if (char) {
            const charFillStyle = charColor ? charColor : 'white';
            this.paintChar(ctx, char, charFillStyle, x, y, isHover);
        }
    }

    public outlineSquare (ctx: CanvasRenderingContext2D, x: number, y: number, borderWidth: number = 1): void {
        ctx.strokeStyle = 'white';
        ctx.lineWidth = borderWidth * this.z;
        ctx.strokeRect(
            (this.SQUARE_SIZE * x + borderWidth / 2) * this.z - this.camera.position.x, 
            (this.SQUARE_SIZE * y + borderWidth / 2) * this.z - this.camera.position.y, 
            (this.SQUARE_SIZE - borderWidth) * this.z, 
            (this.SQUARE_SIZE - borderWidth) * this.z
        );
    }

    public paintProgressBar (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, progress: number): void {
        ctx.globalAlpha = 0.65;

        ctx.fillStyle = 'white';
        ctx.fillRect(
            this.SQUARE_SIZE * x * this.z - this.camera.position.x, 
            this.SQUARE_SIZE * y * this.z - this.camera.position.y, 
            this.SQUARE_SIZE * width * this.z, 
            this.SQUARE_SIZE * height * this.z
        );

        ctx.fillStyle = 'green';
        ctx.fillRect(
            (this.SQUARE_SIZE * x + 1) * this.z - this.camera.position.x, 
            (this.SQUARE_SIZE * y + 1) * this.z - this.camera.position.y, 
            (this.SQUARE_SIZE * width - 2) * this.z * progress, 
            (this.SQUARE_SIZE * height - 2) * this.z
        );

        ctx.globalAlpha = 1;
    }

    public render (world: World): void {
        const ctx = this._canvas.getContext('2d');
        if (!ctx) {
            return;
        }

        const mouseWorldPos = this.camera.worldPosFromScreen(this.mousePos);

        ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);

        const xStart = Math.floor(this.camera.position.x / (this.SQUARE_SIZE * this.camera.zoomAmount));
        const xEnd = Math.ceil((this.camera.position.x + window.innerWidth) / (this.SQUARE_SIZE * this.camera.zoomAmount));
        const yStart = Math.floor(this.camera.position.y / (this.SQUARE_SIZE * this.camera.zoomAmount));
        const yEnd = Math.ceil((this.camera.position.y + window.innerHeight) / (this.SQUARE_SIZE * this.camera.zoomAmount));

        // Draw empty squares around world
        for (let y = yStart; y < yEnd; y++) {
            for (let x = xStart; x < xEnd; x++) {
                this.paintSquare(ctx, x, y, false, Util.lightenDarkenColor(EmptyTile.COLOR, 8));
            }
        }

        // Draw world itself
        for (let y = 0; y < world.tiles.length; y++) {
            for (let x = 0; x < world.tiles[y].length; x++) {
                ctx.globalAlpha = 1;

                const isHover = Math.floor(mouseWorldPos.x) === x && Math.floor(mouseWorldPos.y)  === y;

                const tile = world.tiles[y][x];
                tile.render(this, ctx, x, y, isHover);

                if (isHover) {
                    this.outlineSquare(ctx, x, y);
                }

                tile.renderLatest(this, ctx, x, y, isHover);
            }
        }

        // Draw entities
        for (const entity of world.entities) {
            this.paintChar(ctx, entity.getChar(), 'white', entity.position.x, entity.position.y, false);
        }
    }
}