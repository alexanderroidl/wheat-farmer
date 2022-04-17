import * as PIXI from "pixi.js";
import Browser from "./browser/browser";
import { World } from "./base/world";
import Graphics from "./base/graphics";
import Vector from "./core/vector";
import TitleScreen from "./title-screen/title-screen";
import Sound from "./base/sound";
import RobotEntity from "./entities/robot";

declare global {
  interface Window {
    wheatFarmer: {
      spawnEnemy: (count: number) => void
    };
  }
}

export default class Game {
  public static readonly clickCooldownMs = 350;
  private static _instance: Game;

  private _graphics: Graphics;
  private _pixi: PIXI.Application;
  private _world?: World;
  private _browser: Browser = new Browser();
  private _titleScreen: TitleScreen = new TitleScreen();
  private _timeSinceLastClick: number = 0;
  private _paused: boolean = false;
  private _titleScreenHiddenBefore: boolean | null = null;
  private _lastUpdateRun: number = 0;
  private _keysPressed: string[] = [];
  private _clickedAt: Vector | null = null;

  public static get instance (): Game {
    if (!Game._instance) {
      Game._instance = new Game();
    }

    return Game._instance;
  }

  constructor () {
    this._pixi = this.setupPIXI();
    Browser.addPixi(this._pixi);

    this._graphics = new Graphics(() => {
      this._world = this.setupWorld();
    });
    this.setupMouse();
    this.setupKeyboard();
    this.setupTouchScreen();
    this.setupCLI();
  }

  private setupWorld (): World {
    const world = new World(this._graphics);

    // Create and add background tile sprite
    const bgSprite = this.createBackgroundSprite();
    this._pixi.stage.addChild(bgSprite);

    const debug = new PIXI.Text("", {
      fontSize: 10
    });
    debug.scale.set(1.0 / Graphics.SQUARE_SIZE);
    debug.anchor.set(0.5, 0.5);
      
    // World has added sprite
    world.on("spriteAdded", (sprite: PIXI.Sprite) => {
      this._pixi.stage.addChild(sprite);
    });

    // World has removed sprite
    world.on("spriteRemoved", (sprite: PIXI.Sprite) => {
      this._pixi.stage.removeChild(sprite);
    });
    
    this._graphics.camera.on("moved", (position: Vector) => {
      bgSprite.pivot.set(position.x - position.x % Graphics.SQUARE_SIZE, position.y - position.y % Graphics.SQUARE_SIZE);
      debug.text = `Camera: ${position}`;
    });

    this._graphics.camera.on("zoomed", (e) => {
      // DO NOTHING
    });

    // Graphics finished loading -> add ticker
    this._pixi.ticker.add((delta: number) => {
      this.update(delta, world);
    });

    // Fill world with empty squares
    world.fillWithEmpty();
    world.create(RobotEntity, RobotEntity.textureNames, new Vector(-3));

    this._graphics.camera.move(world.SIZE / 2);

    this._pixi.stage.addChild(debug);

    return world;
  }

  private setupPIXI (): PIXI.Application {
    const pixi = new PIXI.Application({
      resizeTo: window,
      backgroundColor: 0x1099bb,
      resolution: window.devicePixelRatio || 1
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
    this._browser.onScroll = (delta: number) => {
      const getMouseWorldPos = () => this._graphics.camera.worldPosFromScreen(this._browser.mouse.position);
      const oldMouseWorldPos = getMouseWorldPos();
      this._graphics.camera.zoom -= delta / 5;
      const mouseDelta = oldMouseWorldPos.add(getMouseWorldPos().multiply(-1));
      this._graphics.camera.move(mouseDelta);
    };

    this._browser.onMouseMove = (pos: Vector) => {
      this._graphics.mousePos = new Vector(pos.x, pos.y);
    };

    this._browser.onMouseClick = (pos: Vector) => {
      this._clickedAt = pos;

      // Title screen was clicked
      if (!this._titleScreen.hidden) {
        this._titleScreen.onClick(pos);
        this._timeSinceLastClick = 0;
        return;
      }
    };
  }

  private setupKeyboard (): void {
    this._browser.onKeyDown = (keyCode: number, code: string) => {
      if (!this._keysPressed.includes(code)) {
        this._keysPressed.push(code);
      }
    };

    // On browser key up
    this._browser.onKeyUp = (keyCode: number, code: string) => {
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
    };
  }

  private setupTouchScreen (): void {
    // On browser touch start
    this._browser.onTouchStart = () => {
      Sound.unlockAll();
    };
  }

  private update (d: number, world: World): void {
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

    const cameraMoveDelta = cameraMove.multiply(d * this._graphics.camera.z);
    this._graphics.camera.move(cameraMoveDelta);


    this._pixi.stage.scale.set(Graphics.SQUARE_SIZE * this._graphics.camera.z);
    this._pixi.stage.pivot.set(this._graphics.camera.position.x, this._graphics.camera.position.y);
    this._pixi.stage.x = this._pixi.screen.width / 2;
    this._pixi.stage.y = this._pixi.screen.height / 2;

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
    world.update(delta);

    // Render stats
    this._browser.gui.renderWorldStatsHTML(world);

    // Debug GET parameter provided
    if (Browser.debug) {
      // Render debug info
      this._browser.gui.renderDebug(this._graphics.camera, this._graphics, world, 42); // TODO: Set PIXI.js fps
    }

    // Trigger click on tile if mouse is down
    let clicked = false;
    if (this._clickedAt !== null) {
      if (this._timeSinceLastClick > Game.clickCooldownMs) {
        clicked = true;

        const worldPos = this._graphics.camera.worldPosFromScreen(this._clickedAt ?? this._graphics.mousePos);
        this._clickedAt = null;

        if (!world.onWorldClicked(worldPos)) {
          world.onTileClicked(worldPos.floor());
        }
      }
    }

    this._timeSinceLastClick = clicked ? 0 : this._timeSinceLastClick + delta;
  }

  public createBackgroundSprite (): PIXI.Sprite {
    const bgTexture = this._graphics.getTexture("bg 0");
    const bg = new PIXI.TilingSprite(bgTexture);
    bg.tileScale.set(1.0 / Graphics.SQUARE_SIZE);
    bg.anchor.set(0.5);
    return bg;
  }
}