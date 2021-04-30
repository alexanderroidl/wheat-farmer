import World from "./world";
import Camera from "./camera";

export default class Renderer {
    readonly FONT_SIZE = 12;
    readonly SQUARE_SIZE = 32;

    private canvas: HTMLCanvasElement = document.createElement('canvas');
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
        return this.canvas.width;
    }

    get height () {
        return this.canvas.height;
    }

    constructor () {
        this.setupCanvas();
        this.camera = new Camera(this.SQUARE_SIZE);
    }

    setupCanvas () {
        this.setToWindowSize();

        window.addEventListener('load', (e) => {
            this.setToWindowSize();
        });

        window.addEventListener('resize', (e) => {
            this.setToWindowSize();
        });

        document.body.append(this.canvas);
    }

    setToWindowSize () {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    render (world: World): void {
        const ctx = this.canvas.getContext('2d');
        if (!ctx) {
            return;
        }

        const zoom = this.camera.zoomAmount;
        const mouseWorldPos = this.camera.getWorldCoordsFromScreen(this._mouseX, this._mouseY);

        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let y = 0; y < world.tiles.length; y++) {
            for (let x = 0; x < world.tiles[y].length; x++) {
                ctx.globalAlpha = 1;

                const tile = world.tiles[y][x];

                ctx.fillStyle = tile.getHexColor();
                ctx.fillRect(
                    this.SQUARE_SIZE * x * zoom - this.camera.x, 
                    this.SQUARE_SIZE * y * zoom - this.camera.y, 
                    this.SQUARE_SIZE * zoom, 
                    this.SQUARE_SIZE * zoom
                );

                ctx.font = `${Math.floor(this.FONT_SIZE * zoom)}px "Courier New"`;
                ctx.fillStyle = "white";
                ctx.textAlign = "center";

                ctx.fillText(
                    tile.getChar(), 
                    this.SQUARE_SIZE * x * zoom + this.SQUARE_SIZE / 2 * zoom - this.camera.x, 
                    this.SQUARE_SIZE * y * zoom + this.SQUARE_SIZE / 2 * zoom - this.camera.y
                ); 



                if (Math.floor(mouseWorldPos.x) === x && Math.floor(mouseWorldPos.y)  === y) {
                    ctx.globalAlpha = 0.5;

                    console.log('indside')

                    ctx.fillStyle = 'red';
                    ctx.fillRect(
                        this.SQUARE_SIZE * x * zoom - this.camera.x, 
                        this.SQUARE_SIZE * y * zoom - this.camera.y, 
                        this.SQUARE_SIZE * zoom, 
                        this.SQUARE_SIZE * zoom
                    );
                }
            }
        }
    }
}