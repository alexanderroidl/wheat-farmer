import MoveableSprite from "@graphics/moveable-sprite";
import Graphics from "@graphics/graphics";
import { World } from "@world/world";
import { Browser } from "@base/browser/browser";
import Vector from "@core/vector";
import TitleScreen from "@graphics/title-screen/title-screen";
import BombEntity from "@world/entities/bomb";
import { InputHandler, InputKeys } from "@base/input-handler";

declare global {
  interface Window {
    wheatFarmer: {
      spawnEnemy: (count: number) => void
    };
  }
}

export default class Game {
  private _graphics: Graphics;
  private _world: World = new World();
  private _browser: Browser = new Browser();
  private _titleScreen: TitleScreen = new TitleScreen();
  private _inputHandler: InputHandler = new InputHandler(this._browser);
  private _paused: boolean = false;
  private _titleScreenHiddenBefore: boolean | null = null;
  private _lastUpdateRun: number = 0;

  constructor (graphics: Graphics) {
    if (graphics.loading) {
      throw Error("Graphics not ready yet");
    }
    this._graphics = graphics;

    this.setupWorld();
    this.setupCLI();
    this._titleScreen.hidden = true;
  }

  private setupWorld (): void {
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
  }

  private setupCLI (): void {
    if (Browser.debug) {
      window.wheatFarmer = {
        spawnEnemy: (count: number = 1): void => {
          console.log(`Scheduled ${count} enemies to spawn`);
          this._world.scheduleEnemySpawn(count);
        }
      };
    }
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

  private processUserInput (d: number): void {
    const {
      clickedScreenPos,
      cameraDragDelta,
      cameraMoveDelta,
      cameraZoomDelta,
      scrollDelta
    } = this._inputHandler.process(d);

    let totalCameraMoveDelta = cameraMoveDelta;

    if (clickedScreenPos instanceof Vector) {
      if (!this._titleScreen.hidden) {
        this._titleScreen.onClick(clickedScreenPos);
        return;
      }

      const worldPos = this._graphics.getWorldPosFromScreen(clickedScreenPos);

      if (Browser.debug && this._inputHandler.isKeyPressed(InputKeys.ExplodeOnClick)) {
        const radius = Math.floor(Math.random() * (BombEntity.maxExplosionRadius + 1));
        this._world.createExplosion(worldPos, radius, BombEntity.maxExplosionRadius);
      } else {
        this._world.onTileClicked(worldPos.floor());
      }
    }

    // Is dragging mouse
    if (cameraDragDelta.length) {
      const mouseDeltaWorld = cameraDragDelta.divide(Graphics.SQUARE_SIZE * this._graphics.camera.z);
      totalCameraMoveDelta = totalCameraMoveDelta.substract(mouseDeltaWorld);
    }
    totalCameraMoveDelta = totalCameraMoveDelta.divide(this._graphics.camera.z);

    // Is scrolling
    if (scrollDelta) {
      const oldZoom = this._graphics.camera.z;

      // Zoom out
      this._graphics.camera.z -= scrollDelta / 5;

      // Calculate delta for pointed at ingame coordinates before and after zoom
      const mouseWorldDelta = this._browser.mouse.position
        .substract(new Vector(window.innerWidth, window.innerHeight).divide(2))
        .divide(Graphics.SQUARE_SIZE)
        .multiply(1 / oldZoom - 1 / this._graphics.camera.z);

      // Move camera by using ingame mouse delta
      totalCameraMoveDelta = totalCameraMoveDelta.add(mouseWorldDelta);
    }

    this._graphics.update(d, totalCameraMoveDelta, cameraZoomDelta);
  }

  private update (d: number): void {
    const delta = Date.now() - this._lastUpdateRun;
    this._lastUpdateRun = Date.now();

    this.processUserInput(d);

    // Update title screen
    this.updateTitleScreen(delta);

    // // Stop here if game is currently paused
    if (this._paused) {
      return;
    }

    // Update world
    this._world.update(delta);
    this.updateDebug(d);
  }
}