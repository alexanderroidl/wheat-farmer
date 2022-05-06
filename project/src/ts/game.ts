import MoveableSprite from "./core/moveable-sprite";
import Graphics from "./base/graphics";
import Sound from "./base/sound";
import { World } from "./base/world";
import { Browser } from "./browser/browser";
import Vector from "./core/vector";
import RobotEntity from "./entities/robot";
import TitleScreen from "./title-screen/title-screen";

declare global {
  interface Window {
    wheatFarmer: {
      spawnEnemy: (count: number) => void
    };
  }
}

export default class Game {
  public static readonly CLICK_COOLDOWN_MS = 350;
  public static readonly MOUSE_DRAG_TRESHOLD = 50;

  private _graphics: Graphics;
  private _world: World = new World();
  private _browser: Browser = new Browser();
  private _titleScreen: TitleScreen = new TitleScreen();
  private _timeSinceLastClick: number = 0;
  private _paused: boolean = false;
  private _titleScreenHiddenBefore: boolean | null = null;
  private _lastUpdateRun: number = 0;
  private _keysPressed: string[] = [];
  private _clickedAt: Vector | null = null;
  private _lastMousePosition?: Vector | null;
  private _draggingMouse: boolean = false;

  constructor (graphics: Graphics) {
    if (graphics.loading) {
      throw Error("Graphics not ready yet");
    }
    this._graphics = graphics;

    this.setupWorld();
    this.setupMouse();
    this.setupKeyboard();
    this.setupTouchScreen();
    this.setupCLI();
  }

  private setupWorld (): void {
    // Create and add background tile sprite
      
    // World has added sprite
    this._world.on("createdSprites", (sprites: MoveableSprite[]) => {
      sprites.forEach(sprite => {
        this._graphics.addChild(sprite);
      });
    });

    // World has removed sprite
    this._world.on("removedSprites", (sprites: MoveableSprite[]) => {
      sprites.forEach(sprite => {
        this._graphics.removeChild(sprite);
      });
    });

    // Graphics finished loading -> add ticker
    this._graphics.ticker.add((delta: number) => {
      this.update(delta);
    });

    // Fill world with empty squares
    // this._world.initChunks();
    this._world.create(RobotEntity, new Vector(1.5, 1.5));
    this._world.create(RobotEntity, new Vector(0, 9));
    this._world.create(RobotEntity, new Vector(9, 9));
  }

  private setupCLI (): void {
    if (Browser.debug) {
      window.wheatFarmer = {
        spawnEnemy: (count: number = 1): void => {
          if (!this._world) {
            console.error("World not ready yet");
            return;
          }
          console.log(`Scheduled ${count} enemies to spawn`);
          this._world.scheduleEnemySpawn(count);
        }
      };
    }
  }

  private setupMouse (): void {
    this._browser.on("scroll", (delta: number) => {
      const oldZoom = this._graphics.camera.z;

      // Zoom out
      this._graphics.camera.z -= delta / 5;

      // Calculate delta for pointed at ingame coordinates before and after zoom
      const mouseDelta = this._browser.mouse.position
        .substract(new Vector(window.innerWidth, window.innerHeight).divide(2))
        .divide(Graphics.SQUARE_SIZE)
        .multiply(1 / oldZoom - 1 / this._graphics.camera.z);

      // Move camera by using ingame mouse delta
      this._graphics.camera.move(mouseDelta);
    });

    this._browser.on("mouseClick", (pos: Vector) => {
      this._clickedAt = pos;

      // Title screen was clicked
      if (!this._titleScreen.hidden) {
        this._titleScreen.onClick(pos);
        this._timeSinceLastClick = 0;
        return;
      }
    });
  }

  private setupKeyboard (): void {
    this._browser.on("keyDown", (keyCode: number, code: string) => {
      if (!this._keysPressed.includes(code)) {
        this._keysPressed.push(code);
      }
    });

    // On browser key up
    this._browser.on("keyUp", (keyCode: number, code: string) => {
      const codeIndex = this._keysPressed.indexOf(code);
      if (codeIndex !== -1) {
        delete this._keysPressed[codeIndex];
      }
    });
  }

  private setupTouchScreen (): void {
    // On browser touch start
    this._browser.on("touchStart", () => {
      Sound.unlockAll();
    });
  }

  private handleUserInput (d: number): {
    cameraMoveDelta: Vector;
    cameraZoomDelta: number;
  } {
    let cameraMoveDelta = new Vector(0);
    let cameraZoomDelta = 0;

    if (this._keysPressed.includes("KeyW")) {
      cameraMoveDelta.y -= 0.1 * d;
    }

    if (this._keysPressed.includes("KeyA")) {
      cameraMoveDelta.x -= 0.1 * d;
    }

    if (this._keysPressed.includes("KeyD")) {
      cameraMoveDelta.x += 0.1 * d;
    }

    if (this._keysPressed.includes("KeyS")) {
      cameraMoveDelta.y += 0.1 * d;
    }

    if (this._keysPressed.includes("BracketRight")) {
      cameraZoomDelta = 0.01 * d;
    }

    if (this._keysPressed.includes("Slash")) {
      cameraZoomDelta = -0.01 * d;
    }

    // // "Escape" pressed
    // if (code === "Escape") {
    //   this._titleScreen.hidden = false;
    //   return;
    // }

    // // "S" pressed
    // if (code === "KeyS" && this._world) {
    //   this._paused = true;

    //   // Open shop
    //   this._browser.gui.openShop(this._world.player.items, () => {
    //     this._paused = false;
    //   });
    // }

    // // "E" pressed
    // if (code === "KeyE" && this._world) {
    //   this._paused = true;

    //   // Open inventory
    //   this._browser.gui.openInventory(this._world.player, this._world.player.items, () => {
    //     this._paused = false;
    //   });
    // }

    if (this._keysPressed.includes("ShiftLeft") || this._keysPressed.includes("ShiftRight")) {
      cameraMoveDelta = cameraMoveDelta.multiply(2);
    }

    if (cameraMoveDelta.length) {
      cameraMoveDelta = cameraMoveDelta.multiply(1 / this._graphics.camera.z);
    }
    
    if (this._browser.mouse.pressed) {
      let mouseMoveDelta: Vector = new Vector(0);

      if (this._lastMousePosition) {
        mouseMoveDelta = this._browser.mouse.position.substract(this._lastMousePosition);

        if (mouseMoveDelta.length > Game.MOUSE_DRAG_TRESHOLD) {
          const mouseDeltaWorld = mouseMoveDelta.divide(Graphics.SQUARE_SIZE * this._graphics.camera.z);
          cameraMoveDelta = cameraMoveDelta.add(mouseDeltaWorld.multiply(-1));
          this._draggingMouse = true;
        }
      }
      
      if (this._lastMousePosition == null || mouseMoveDelta.length > Game.MOUSE_DRAG_TRESHOLD) {
        this._lastMousePosition = new Vector(this._browser.mouse.position);
      }
    } else {
      this._lastMousePosition = null;
    }

    return {
      cameraMoveDelta,
      cameraZoomDelta
    };
  }

  private handleUserClickAndDrag (d: number): boolean {
    // Trigger click on tile if mouse is down
    let clicked = false;

    // Stopped dragging mouse
    if (this._draggingMouse && !this._lastMousePosition) {
      this._clickedAt = null;
      this._draggingMouse = false;
    }
    
    if (this._clickedAt !== null) {
      if (this._timeSinceLastClick > Game.CLICK_COOLDOWN_MS) {
        clicked = true;

        const worldPos = this._graphics.getWorldPosFromScreen(this._clickedAt);
        this._clickedAt = null;

        this._world.onTileClicked(worldPos.floor());
      }
    }

    return clicked;
  }

  private updateTitleScreen (dMs: number): void {
    Browser.toggleTitleScreen(!this._titleScreen.hidden);

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
      this._titleScreen.update(dMs);
      // return;
    }
  }

  private updateDebug (d: number): void {
    // Render stats
    this._browser.gui.renderWorldStatsHTML(this._world);

    // Debug GET parameter provided
    if (Browser.debug) {
      // Render debug info
      this._browser.gui.renderDebug(this._graphics.camera, this._graphics, this._world, 42); // TODO: Set PIXI.js fps
    }
  }

  private update (d: number): void {
    const delta = Date.now() - this._lastUpdateRun;
    this._lastUpdateRun = Date.now();
    
    const { cameraMoveDelta, cameraZoomDelta } = this.handleUserInput(d);
    this._graphics.update(d, cameraMoveDelta, cameraZoomDelta);

    this.updateTitleScreen(delta);

    // // // Stop here if game is currently paused
    // if (this._paused) {
    //   return;
    // }

    // Update world
    this._world.update(delta);
    this.updateDebug(d);

    // Trigger click on tile if mouse is down
    const userIsClicking = this.handleUserClickAndDrag(d);
    this._timeSinceLastClick = userIsClicking ? 0 : this._timeSinceLastClick + delta;
  }
}