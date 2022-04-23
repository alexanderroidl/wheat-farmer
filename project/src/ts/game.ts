import * as PIXI from "pixi.js";
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
  private _pixi: PIXI.Application;
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

    this._pixi = this.setupPIXI();
    Browser.addPixi(this._pixi);

    this.setupWorld();
    this.setupMouse();
    this.setupKeyboard();
    this.setupTouchScreen();
    this.setupCLI();
  }

  private setupWorld (): void {
    // Create and add background tile sprite
    this._pixi.stage.addChild(this._graphics.bgSprite);
    this._pixi.stage.addChild(this._graphics.debugText);
    this._pixi.stage.addChild(this._graphics.graphics);

    this._pixi.stage.sortableChildren = true;
      
    // World has added sprite
    this._world.on("entityAdded", (sprite: PIXI.Sprite) => {
      this._pixi.stage.addChild(sprite);
    });

    // World has removed sprite
    this._world.on("entityRemoved", (sprite: PIXI.Sprite) => {
      this._pixi.stage.removeChild(sprite);
    });

    // Graphics finished loading -> add ticker
    this._pixi.ticker.add((delta: number) => {
      this.update(delta);
    });

    // Fill world with empty squares
    this._world.fillWithEmpty();
    this._world.create(RobotEntity, new Vector(-3));

    this._graphics.camera.move(this._world.SIZE / 2);
  }

  private setupPIXI (): PIXI.Application {
    const pixi = new PIXI.Application({
      resizeTo: window,
      backgroundColor: 0x1099bb,
      resolution: window.devicePixelRatio
    });

    PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

    return pixi;
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
      const getMouseWorldPos = () => this._graphics.camera.worldPosFromScreen(this._browser.mouse.position);
      const oldMouseWorldPos = getMouseWorldPos();
      this._graphics.camera.z -= delta / 5;
      const mouseDelta = oldMouseWorldPos.add(getMouseWorldPos().multiply(-1));
      this._graphics.camera.move(mouseDelta);
    });

    this._browser.on("mouseMove", (pos: Vector) => {
      this._graphics.mousePos = new Vector(pos.x, pos.y);
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
    });
  }

  private setupTouchScreen (): void {
    // On browser touch start
    this._browser.on("touchStart", () => {
      Sound.unlockAll();
    });
  }

  private update (d: number): void {
    const delta = Date.now() - this._lastUpdateRun;
    this._lastUpdateRun = Date.now();
    
    Browser.toggleTitleScreen(!this._titleScreen.hidden);

    const cameraMove = new Vector(0);
    if (this._keysPressed.includes("KeyW")) {
      cameraMove.y -= 0.1 * d;
    }

    if (this._keysPressed.includes("KeyA")) {
      cameraMove.x -= 0.1 * d;
    }

    if (this._keysPressed.includes("KeyD")) {
      cameraMove.x += 0.1 * d;
    }

    if (this._keysPressed.includes("KeyS")) {
      cameraMove.y += 0.1 * d;
    }

    if (this._keysPressed.includes("BracketRight")) {
      this._graphics.camera.z += 0.01 * d;
    }

    if (this._keysPressed.includes("Slash")) {
      this._graphics.camera.z -= 0.01 * d;
    }

    if (cameraMove.length) {
      let cameraMoveDelta = cameraMove.multiply(d * this._graphics.camera.z);

      if (this._keysPressed.includes("ShiftLeft") || this._keysPressed.includes("ShiftRight")) {
        cameraMoveDelta = cameraMoveDelta.multiply(2);
      }
      this._graphics.camera.move(cameraMoveDelta);
    }
    
    if (this._browser.mouse.pressed) {
      let mouseMoveDelta: Vector = new Vector(0);

      if (this._lastMousePosition) {
        mouseMoveDelta = this._browser.mouse.position.add(this._lastMousePosition.multiply(-1));

        if (mouseMoveDelta.length > Game.MOUSE_DRAG_TRESHOLD) {
          const mouseDeltaWorld = mouseMoveDelta.multiply(-1 / (Graphics.SQUARE_SIZE * this._graphics.camera.z));
          this._graphics.camera.move(mouseDeltaWorld);
          this._draggingMouse = true;
        }
      }
      
      if (this._lastMousePosition == null || mouseMoveDelta.length > Game.MOUSE_DRAG_TRESHOLD) {
        this._lastMousePosition = new Vector(this._browser.mouse.position);
      }
    } else {
      this._lastMousePosition = null;
    }

    this._pixi.stage.scale.set(Graphics.SQUARE_SIZE * this._graphics.camera.z * (1 / window.devicePixelRatio));
    this._pixi.stage.pivot.set(this._graphics.camera.x, this._graphics.camera.y);
    this._pixi.stage.x = this._pixi.screen.width / (2 * window.devicePixelRatio);
    this._pixi.stage.y = this._pixi.screen.height / (2 * window.devicePixelRatio);

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
      // return;
    }

    // // Stop here if game is currently paused
    // if (this._paused) {
    //   return;
    // }

    // Update world
    this._world.update(delta);

    // Render stats
    this._browser.gui.renderWorldStatsHTML(this._world);

    // Debug GET parameter provided
    if (Browser.debug) {
      // Render debug info
      this._browser.gui.renderDebug(this._graphics.camera, this._graphics, this._world, 42); // TODO: Set PIXI.js fps
    }

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

        const worldPos = this._graphics.camera.worldPosFromScreen(this._clickedAt);
        this._clickedAt = null;

        if (!this._world.onWorldClicked(worldPos)) {
          this._world.onTileClicked(worldPos.floor());
        }
      }
    }

    this._timeSinceLastClick = clicked ? 0 : this._timeSinceLastClick + delta;
  }
}