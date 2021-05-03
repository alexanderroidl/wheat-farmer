import GameLoop from "../core/game-loop";
import Browser from "./browser";
import World from "./world";
import Renderer from "../core/renderer";
import Vector from "../core/vector";

export default class Game {
    private static _instance: Game;

    private loop: GameLoop = new GameLoop();
    private renderer: Renderer = new Renderer();
    private world: World = new World();
    private browser: Browser = new Browser();

    public static get instance (): Game {
        if (!Game._instance) {
            Game._instance = new Game();
        }
    
        return Game._instance;
    }

    constructor () {
        this.setupLoop();
        this.setupMouse();
        this.setupWindow();

        this.renderer.camera.setup(this.world.SIZE);
    }

    private setupMouse (): void {
        const mouseDownPos = new Vector(0, 0);

        this.browser.onScroll = (delta: number) => {
            this.renderer.camera.zoom(-delta / 5)
        }

        this.browser.onMouseDown = (pos: Vector) => {
            mouseDownPos.x = pos.x;
            mouseDownPos.y = pos.y;
        }

        this.browser.onMouseMove = (pos: Vector) => {
            this.renderer.mousePos.x = pos.x;
            this.renderer.mousePos.y = pos.y;
        }

        this.browser.onMouseDrag = (pos: Vector) => {
            const deltaX = mouseDownPos.x - pos.x;
            const deltaY = mouseDownPos.y - pos.y;

            this.renderer.camera.move(deltaX / 25, deltaY / 25);
        }

        this.browser.onMouseClick = (pos: Vector) => {
            const worldClickPos = this.renderer.camera.worldPosFromScreen(pos);
            this.world.onTileClicked(worldClickPos.floor());
        };
    }

    private setupWindow (): void {
        this.browser.onResize = (width: number, height: number, oldWidth: number, oldHeight: number) => {
            // Todo: Add logic
        };
    }

    private setupLoop (): void {
        this.loop.update = (delta: number) => {
            this.world.update(delta);
        };

        this.loop.render = (interpolation: number) => {
            this.renderer.render(this.world);

            this.browser.renderStats(this.world);

            if (this.browser.getParameter('debug')) {
                this.browser.renderDebug(this.renderer.camera, this.renderer, this.world);
            }
        };

        this.loop.start();
    }
}