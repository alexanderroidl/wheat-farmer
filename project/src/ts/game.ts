import GameLoop from "./core/game-loop";
import Browser from "./browser/browser";
import World from "./base/world";
import Renderer from "./base/renderer";
import Vector from "./core/vector";
import TitleScreen from "./title-screen/title-screen";
import Sound from "./base/sound";

declare global {
  interface Window {
    wheatFarmer: {
      spawnEnemy: (count: number) => void
    };
  }
}

export default class Game {
  private static _instance: Game;

  private _loop: GameLoop = new GameLoop();
  private _world: World = new World();
  private _browser: Browser = new Browser();
  private _renderer: Renderer = new Renderer(this._browser);
  private _titleScreen: TitleScreen = new TitleScreen();
  private _mouseDown: boolean = false;
  private _lastClickAt: number = Date.now();
  private _paused: boolean = false;
  private _titleScreenHiddenBefore: boolean | null = null;

  public static get instance (): Game {
    if (!Game._instance) {
      Game._instance = new Game();
    }

    return Game._instance;
  }

  constructor () {
    this.setupLoop();
    this.setupMouse();
    this.setupKeyboard();
    this.setupTouchScreen();
    this.setupWindow();
    this.setupCLI();

    this._renderer.camera.setup(this._world.SIZE);
  }

  private setupCLI (): void {
    if (Browser.getParameter("debug")) {
      window.wheatFarmer = {
        spawnEnemy: (count: number = 1): void => {
          console.log(`Scheduled ${count} enemies to spawn`);
          this._world.scheduleEnemySpawn(count);
        }
      };
    }
  }

  private setupMouse (): void {
    // On browser scroll
    this._browser.onScroll = (delta: number) => {
      this._renderer.camera.zoom(-delta / 5);
    };

    // On browser mouse down
    this._browser.onMouseDown = (pos: Vector) => {
      this._mouseDown = true;
    };

    // On browser mouse up
    this._browser.onMouseUp = (pos: Vector) => {
      this._mouseDown = false;
    };

    // On browser mouse move
    this._browser.onMouseMove = (pos: Vector) => {
      this._renderer.mousePos = new Vector(pos.x, pos.y);
    };

    // On browser mouse click
    this._browser.onMouseClick = (pos: Vector) => {
      // Title screen was clicked
      if (!this._titleScreen.hidden) {
        this._titleScreen.onClick(pos);
        this._lastClickAt = Date.now();
        return;
      }
    };
  }

  private setupKeyboard (): void {
    // On browser key up
    this._browser.onKeyUp = (keyCode: number, code: string) => {
      if (this._titleScreen.hidden) {
        // "Escape" pressed
        if (code === "Escape") {
          this._titleScreen.hidden = false;
          return;
        }

        // "S" pressed
        if (code === "KeyS") {
          this._paused = true;

          // Open shop
          this._browser.gui.openShop(this._world.player.items, () => {
            this._paused = false;
          });
        }

        // "E" pressed
        if (code === "KeyE") {
          this._paused = true;

          // Open inventory
          this._browser.gui.openInventory(this._world.player, this._world.player.items, () => {
            this._paused = false;
          });
        }
      }
    };
  }

  private setupTouchScreen (): void {
    // On browser touch start
    this._browser.onTouchStart = () => {
      Sound.unlockAll();
    };
  }

  private setupWindow (): void {
    // On browser window resize
    this._browser.onResize = (size: Vector, oldSize: Vector) => {
      const deltaWidth = oldSize.x - size.x;
      const deltaHeight = oldSize.y - size.y;

      // Move camera to be centered again
      this._renderer.camera.move(
        deltaWidth / 2,
        deltaHeight / 2
      );
    };
  }


  private onUpdate (delta: number): void {
    // TODO: Move to Browser class
    document.body.classList.toggle("titlescreen", !this._titleScreen.hidden);

    if (this._titleScreenHiddenBefore !== this._titleScreen.hidden) {
      if (this._titleScreen.hidden) {
        this._paused = false;
      } else {
        this._paused = true;
      }

      this._titleScreenHiddenBefore = this._titleScreen.hidden;
    }

    // Update title screen if it's not hidden
    if (!this._titleScreen.hidden) {
      this._titleScreen.update(delta);
      return;
    }

    // Stop here if game is currently paused
    if (this._paused) {
      return;
    }

    // Update world
    this._world.update(delta);

    // Trigger click on tile if mouse is down
    if (this._mouseDown) {
      // 500ms have passed since last click
      if ((Date.now() - this._lastClickAt) > 500) {
        this._lastClickAt = Date.now();

        const worldPos = this._renderer.camera.worldPosFromScreen(this._renderer.mousePos);
        if (!this._world.onWorldClicked(worldPos)) {
          this._world.onTileClicked(worldPos.floor());
        }
      }
    }
  }

  private onRender (interpolation: number) {
    this._renderer.size = this._browser.windowSize;

    // Render title screen if it's not hidden and canvas context is given
    if (!this._titleScreen.hidden) {
      this._renderer.renderTitleScreen(this._titleScreen);
      return;
    }

    // Stop here if game is currently paused
    if (this._paused) {
      return;
    }

    // Render world
    this._renderer.render(this._world);

    // Render stats
    this._browser.gui.renderWorldStatsHTML(this._world);

    // Debug GET parameter provided
    if (Browser.getParameter("debug")) {
      // Render debug info
      this._browser.gui.renderDebug(this._renderer.camera, this._renderer, this._world, this._loop.fps);
    }
  }


  /**
   * Setup and start game update and render loops
   */
  private setupLoop (): void {
    // Update loop
    this._loop.update = (delta: number) => {
      this.onUpdate(delta);
    };

    // Render loop
    this._loop.render = (interpolation: number) => {
      this.onRender(interpolation);
    };

    // Start game update and render loops
    this._loop.start();
  }
}