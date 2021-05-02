import World from "../base/world";
import Camera from "../base/camera";
import EmptyTile from "../tiles/empty";

export default class Renderer {
    public readonly FONT_SIZE = 12;
    public readonly SQUARE_SIZE = 32;

    private _canvas: HTMLCanvasElement = document.createElement('canvas');
    public readonly camera: Camera;

    public mouseX: number = 0;
    public mouseY: number = 0;

    get width () {
        return this._canvas.width;
    }

    get height () {
        return this._canvas.height;
    }

    get z () {
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

    public paintSquare (ctx: any, x: number, y: number, isHover: boolean, fillStyle: string, opacity: number = 1, char?: string | null, charColor?: string | null): void {
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

            if (isHover) {
                ctx.shadowColor = "white";
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;
                ctx.shadowBlur = 5 * zoom;
            }

            ctx.font = `${Math.floor(this.FONT_SIZE * zoom)}px "Courier New"`;
            ctx.fillStyle = charFillStyle;
            ctx.textAlign = "center";
            ctx.textBaseline = 'middle';

            ctx.fillText(
                char, 
                this.SQUARE_SIZE * x * zoom + this.SQUARE_SIZE / 2 * zoom - this.camera.x, 
                this.SQUARE_SIZE * y * zoom + this.SQUARE_SIZE / 2 * zoom - this.camera.y
            ); 

            ctx.shadowBlur = 0;
        }

    }

    public paintProgressBar (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, progress: number) {
        ctx.globalAlpha = 0.65;

        ctx.fillStyle = 'white';
        ctx.fillRect(
            this.SQUARE_SIZE * x * this.z - this.camera.x, 
            this.SQUARE_SIZE * y * this.z - this.camera.y, 
            this.SQUARE_SIZE * width * this.z, 
            this.SQUARE_SIZE * height * this.z
        );

        ctx.fillStyle = 'green';
        ctx.fillRect(
            (this.SQUARE_SIZE * x + 1) * this.z - this.camera.x, 
            (this.SQUARE_SIZE * y + 1) * this.z - this.camera.y, 
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

        const mouseWorldPos = this.camera.worldPosFromScreen(this.mouseX, this.mouseY);

        ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);

        const xStart = Math.floor(this.camera.x / (this.SQUARE_SIZE * this.camera.zoomAmount));
        const xEnd = Math.ceil((this.camera.x + window.innerWidth) / (this.SQUARE_SIZE * this.camera.zoomAmount));
        const yStart = Math.floor(this.camera.y / (this.SQUARE_SIZE * this.camera.zoomAmount));
        const yEnd = Math.ceil((this.camera.y + window.innerHeight) / (this.SQUARE_SIZE * this.camera.zoomAmount));

        for (let y = yStart; y < yEnd; y++) {
            for (let x = xStart; x < xEnd; x++) {
                this.paintSquare(ctx, x, y, false, EmptyTile.COLOR);
            }
        }

        for (let y = 0; y < world.tiles.length; y++) {
            for (let x = 0; x < world.tiles[y].length; x++) {
                ctx.globalAlpha = 1;

                const isHover = Math.floor(mouseWorldPos.x) === x && Math.floor(mouseWorldPos.y)  === y;

                const tile = world.tiles[y][x];
                tile.render(this, ctx, x, y, isHover);

                if (isHover) {
                    ctx.strokeStyle = 'white';
                    ctx.lineWidth = 1 * this.z;
                    ctx.strokeRect(
                        this.SQUARE_SIZE * x * this.z - this.camera.x, 
                        this.SQUARE_SIZE * y * this.z - this.camera.y, 
                        this.SQUARE_SIZE * this.z - 1 * this.z, 
                        this.SQUARE_SIZE * this.z - 1 * this.z
                    );
                }

                tile.renderLatest(this, ctx, x, y, isHover);
            }
        }
    }
}