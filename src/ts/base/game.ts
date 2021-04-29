import GameLoop from "./game-loop";
import Browser from "./browser";
import World from "./world";
import Renderer from "./renderer";

export default class Game {
    private static _instance: Game;

    loop: GameLoop = new GameLoop();
    renderer: Renderer = new Renderer();
    world: World = new World();
    browser: Browser = new Browser(this.world);

    public static get instance () {
        if (!Game._instance) {
            Game._instance = new Game();
        }
    
        return Game._instance;
    }

    constructor () {
        this.setupLoop();

        this.browser.onScroll = (delta: number) => {
            this.renderer.zoom += delta / 10;
        }

        let mouseDownX: number | null = null;
        let mouseDownY: number | null = null;

        this.browser.onMouseDown = (x: number, y: number) => {
            mouseDownX = x;
            mouseDownY = y;
        }

        this.browser.onMouseDrag = (x: number, y: number) => {
            if (!(mouseDownX !== null && mouseDownY !== null)) {
                return;
            }

            const deltaX = mouseDownX - x;
            const deltaY = mouseDownY - y;

            this.renderer.cameraX -= deltaX / 30;
            this.renderer.cameraY -= deltaY / 30;

            //console.log('cameraX', this.renderer.cameraX)
            //console.log('cameraY', this.renderer.cameraY)
        }
    }

    setupLoop () {
        this.loop.fps = 1;
        this.loop.simulationStep = 1000 / 1;
        this.loop.update = (delta: number) => {};
        this.loop.render = (interpolation: number) => {
            this.renderer.render(this.world);
            this.browser.render();
        };

        this.loop.start();
    }
}