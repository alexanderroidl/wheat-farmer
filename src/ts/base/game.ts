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
        this.setupMouse();
        this.renderer.camera.setup(this.world.SIZE);
    }

    setupMouse (): void {
        let mouseDownX: number | null = null;
        let mouseDownY: number | null = null;

        this.browser.onScroll = (delta: number) => {
            this.renderer.camera.zoom(-delta / 5)
        }

        this.browser.onMouseDown = (x: number, y: number) => {
            mouseDownX = x;
            mouseDownY = y;

        }

        this.browser.onMouseMove = (x: number, y: number) => {
            this.renderer.mouseX = x;
            this.renderer.mouseY = y;
        }


        this.browser.onMouseDrag = (x: number, y: number) => {
            if (!(mouseDownX !== null && mouseDownY !== null)) {
                return;
            }

            const deltaX = mouseDownX - x;
            const deltaY = mouseDownY - y;
            this.renderer.camera.move(deltaX / 30, deltaY / 30);
        }
    }

    setupLoop (): void {
        this.loop.fps = 1;
        this.loop.simulationStep = 1000 / 1;
        this.loop.update = (delta: number) => {};
        this.loop.render = (interpolation: number) => {
            this.renderer.render(this.world);
            this.browser.renderStats();
            this.browser.renderDebug(this.renderer.camera);
        };

        this.loop.start();
    }
}