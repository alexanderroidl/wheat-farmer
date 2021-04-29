import World from "./world";

export default class Renderer {
    readonly FONT_SIZE = 12;
    readonly SQUARE_SIZE = 32;

    private canvas: HTMLCanvasElement = document.createElement('canvas');
    public zoom: number = 1;
    public cameraX: number = -window.innerWidth/2;
    public cameraY: number = -window.innerHeight/2;

    get width () {
        return this.canvas.width;
    }

    get height () {
        return this.canvas.height;
    }

    constructor () {
        this.setSize(window.innerWidth, window.innerHeight);

        window.addEventListener('load resize', (e) => {
            this.setSize(window.innerWidth, window.innerHeight);
        });

        document.body.append(this.canvas);
    }

    setSize (screenWidth: number, screenHeight: number) {
        this.canvas.width = screenWidth;
        this.canvas.height = screenHeight;
    }

    render (world: World): void {
        const ctx = this.canvas.getContext('2d');
        if (!ctx) {
            return;
        }

        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for (let y = 0; y < world.tiles.length; y++) {
            for (let x = 0; x < world.tiles[y].length; x++) {
                const tile = world.tiles[y][x];

                ctx.fillStyle = tile.getHexColor();
                ctx.fillRect(
                    this.SQUARE_SIZE * x * this.zoom - this.cameraX, 
                    this.SQUARE_SIZE * y * this.zoom - this.cameraY, 
                    this.SQUARE_SIZE * this.zoom, 
                    this.SQUARE_SIZE * this.zoom
                );

                ctx.font = `${Math.floor(this.FONT_SIZE * this.zoom)}px "Courier New"`;
                ctx.fillStyle = "white";
                ctx.textAlign = "center";

                ctx.fillText(
                    tile.getChar(), 
                    this.SQUARE_SIZE * x * this.zoom + this.SQUARE_SIZE / 2 * this.zoom - this.cameraX, 
                    this.SQUARE_SIZE * y * this.zoom + this.SQUARE_SIZE / 2 * this.zoom - this.cameraY
                ); 
            }
        }
    }
}