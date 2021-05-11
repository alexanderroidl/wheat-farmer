import GameLoop from "../core/game-loop";
import Browser from "./browser";
import World from "./world";
import Renderer from "../core/renderer";
import Vector from "../core/vector";
import TitleScreen from "../title-screen/title-screen";
import Sound from "./sound";

export default class Game {
    private static _instance: Game;

    private loop: GameLoop = new GameLoop();
    private renderer: Renderer = new Renderer();
    private world: World = new World();
    private browser: Browser = new Browser();

    private _mouseDown: boolean = false;
    private _lastClickAt: number = Date.now();
    private _paused: boolean = false;

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
        }

        this.browser.onMouseClick = (pos: Vector) => {
            if (!this.renderer.titleScreen.hidden) {
                this.renderer.titleScreen.onClick(pos);
                this._lastClickAt = Date.now();
                return;
            }

            const worldPos = this.renderer.camera.worldPosFromScreen(pos);
            this.world.onTileClicked(worldPos.floor());
        };

        this.browser.onKeyUp = (keyCode: number, code: string) => {
            if (this.renderer.titleScreen.hidden) {
                if (code === 'Escape') {
                    this._paused = true;
                    this.renderer.titleScreen.hidden = false;
                    return;
                }

                if (code === 'KeyS') {
                    this._paused = true;
                    this.browser.openShop(this.world.player.items, () => {
                        this._paused = false;
                    });
                }

                if (code === 'KeyE') {
                    this._paused = true;
                    this.browser.openInventory(this.world.player, this.world.player.items, () => {
                        this._paused = false;
                    });
                }
            }
        };

        this.browser.onTouchStart = () => {
            console.log('unlock')
            Sound.unlockAll();
        };
    }

    private setupWindow (): void {
        this.browser.onResize = (size: Vector, oldSize: Vector) => {
            const deltaWidth = oldSize.x - size.x;
            const deltaHeight = oldSize.y - size.y;

            this.renderer.camera.move(
                deltaWidth / 2,
                deltaHeight / 2
            );
        };
    }

    private setupLoop (): void {
        this.loop.fps = 30;
        this.loop.update = (delta: number) => {
            document.body.classList.toggle('titlescreen', !this.renderer.titleScreen.hidden)

            if (this._paused || !this.renderer.titleScreen.hidden) {
                return;
            }

            this.world.update(delta);

            if (this._mouseDown) {
                if ((Date.now() - this._lastClickAt) > 250) {
                    const worldPos = this.renderer.camera.worldPosFromScreen(this.renderer.mousePos);
                    this.world.onTileClicked(worldPos.floor());
    
                    this._lastClickAt = Date.now();
                }
            }
        };

        this.loop.render = (interpolation: number) => {
            if (this._paused) {
                return;
            }

            this.renderer.render(this.world);
            if (this.renderer.titleScreen.hidden) {
                this.browser.renderWorldStatsHTML(this.world);

                if (Browser.getParameter('debug')) {
                    this.browser.renderDebug(this.renderer.camera, this.renderer, this.world);
                }
            }
        };

        this.loop.start();
    }
}