import GameLoop from "../core/game-loop";
import Browser from "./browser";
import World from "./world";
import Renderer from "../core/renderer";
import Vector from "../core/vector";

export default class Game {
    private static readonly MOUSE_MOVE_TRESHOLD = 10;
    private static _instance: Game;

    private loop: GameLoop = new GameLoop();
    private renderer: Renderer = new Renderer();
    private world: World = new World();
    private browser: Browser = new Browser();

    private _mouseDown: boolean = false;

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
        this.browser.onScroll = (delta: number) => {
            this.renderer.camera.zoom(-delta / 5)
        }

        this.browser.onMouseDown = (pos: Vector) => {
            this._mouseDown = true;
        }

        this.browser.onMouseUp = (pos: Vector) => {
            this._mouseDown = false;
        }

        this.browser.onMouseMove = (pos: Vector) => {
            this.renderer.mousePos = new Vector(pos.x, pos.y);

            if (this._mouseDown) {
                const worldPos = this.renderer.camera.worldPosFromScreen(pos);
                this.world.onTileClicked(worldPos.floor());
            }
        }

        this.browser.onMouseClick = (pos: Vector) => {
            const worldPos = this.renderer.camera.worldPosFromScreen(pos);
            this.world.onTileClicked(worldPos.floor());
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