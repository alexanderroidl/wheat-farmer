import Sound from "@base/sound";
import { Browser } from "@base/browser/browser";
import Vector from "@core/vector";

export type InputKeyCodes = string[];

export class InputKeys {
  static MoveUp: InputKeyCodes = ["KeyW", "ArrowUp"];
  static MoveLeft: InputKeyCodes = ["KeyA", "ArrowLeft"];
  static MoveDown: InputKeyCodes = ["KeyS", "ArrowDown"];
  static MoveRight: InputKeyCodes = ["KeyD", "ArrowRight"];
  static MoveFaster: InputKeyCodes = ["ShiftLeft", "ShiftRight"];
  static DontDrag: InputKeyCodes = ["Space"];
  static ZoomIn: InputKeyCodes = ["BracketRight"];
  static ZoomOut: InputKeyCodes = ["Slash"];
  static ToggleShop: InputKeyCodes = ["KeyS"];
  static ToggleInventory: InputKeyCodes = ["KeyE"];
  static Menu: InputKeyCodes = ["Escape"];
  static ExplodeOnClick: InputKeyCodes = ["AltLeft"]; // Debug-mode only
}

export class InputHandler {
  public static readonly CLICK_COOLDOWN_MS = 350;
  public static readonly MOUSE_DRAG_TRESHOLD = 50;

  private _browser: Browser;
  private _keysPressed: string[] = [];
  private _scrollDelta: number = 0;
  private _clickedAt: Vector | null = null;
  private _lastMousePosition?: Vector | null;
  private _timeSinceLastClick: number = 0;
  private _lastUpdateRun: number = 0;

  constructor (browser: Browser) {
    this._browser = browser;

    this.setupMouse();
    this.setupKeyboard();
    this.setupTouchScreen();
  }

  public get clickedAt () {
    return this._clickedAt;
  }

  public process (d: number): {
    clickedScreenPos: Vector | null,
    cameraDragDelta: Vector,
    cameraMoveDelta: Vector,
    cameraZoomDelta: number,
    scrollDelta: number
  } {
    const deltaTimeMs = Date.now() - this._lastUpdateRun;
    this._lastUpdateRun = Date.now();

    let clickedScreenPos: Vector | null = null;

    const { cameraDragDelta, cameraMoveDelta, cameraZoomDelta } = this.processMouseAndKeyboard(d);

    // Stopped dragging mouse
    if (cameraDragDelta.length && !this._lastMousePosition) {
      this._clickedAt = null;
    }

    if (this._clickedAt !== null) {
      if (this._timeSinceLastClick > InputHandler.CLICK_COOLDOWN_MS) {
        clickedScreenPos = new Vector(this._clickedAt);
        this._clickedAt = null;
        this._timeSinceLastClick = 0;
      }
    }

    if (!clickedScreenPos) {
      this._timeSinceLastClick += deltaTimeMs;
    }

    const scrollDelta = this._scrollDelta;
    this._scrollDelta = 0;

    return {
      clickedScreenPos,
      cameraDragDelta,
      cameraMoveDelta,
      cameraZoomDelta,
      scrollDelta
    };
  }

  public isKeyPressed (key: InputKeyCodes): boolean {
    return key.reduce((prev: boolean, current: string) => {
      return Boolean(prev || this._keysPressed.includes(current));
    }, false);
  }

  private processMouseAndKeyboard (delta: number): {
    cameraDragDelta: Vector;
    cameraMoveDelta: Vector;
    cameraZoomDelta: number;
  } {
    let cameraDragDelta = new Vector(0);
    let cameraMoveDelta = new Vector(0);
    let cameraZoomDelta = 0;

    if (this.isKeyPressed(InputKeys.MoveUp)) {
      cameraMoveDelta.y -= 0.1 * delta;
    }

    if (this.isKeyPressed(InputKeys.MoveLeft)) {
      cameraMoveDelta.x -= 0.1 * delta;
    }

    if (this.isKeyPressed(InputKeys.MoveRight)) {
      cameraMoveDelta.x += 0.1 * delta;
    }

    if (this.isKeyPressed(InputKeys.MoveDown)) {
      cameraMoveDelta.y += 0.1 * delta;
    }

    if (this.isKeyPressed(InputKeys.ZoomIn)) {
      cameraZoomDelta = 0.01 * delta;
    }

    if (this.isKeyPressed(InputKeys.ZoomOut)) {
      cameraZoomDelta = -0.01 * delta;
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

    if (this.isKeyPressed(InputKeys.MoveFaster)) {
      cameraMoveDelta = cameraMoveDelta.multiply(2);
    }

    if (this._browser.mouse.pressed) {
      // Only drag mouse if space key is not pressed
      if (!this.isKeyPressed(InputKeys.DontDrag)) {
        let mouseMoveDelta: Vector = new Vector(0);

        if (this._lastMousePosition) {
          mouseMoveDelta = this._browser.mouse.position.substract(this._lastMousePosition);

          if (mouseMoveDelta.length > InputHandler.MOUSE_DRAG_TRESHOLD) {
            cameraDragDelta = mouseMoveDelta;
          }
        }

        if (this._lastMousePosition == null || mouseMoveDelta.length > InputHandler.MOUSE_DRAG_TRESHOLD) {
          this._lastMousePosition = new Vector(this._browser.mouse.position);
        }
      } else { // Holding space key
        // Simulate click when moving mouse
        this._clickedAt = new Vector(this._browser.mouse.position);
      }
    } else {
      this._lastMousePosition = null;
    }

    return {
      cameraDragDelta,
      cameraMoveDelta,
      cameraZoomDelta
    };
  }

  private setupMouse (): void {
    this._browser.on("scroll", (delta: number) => {
      this._scrollDelta += delta;
    });

    this._browser.on("mouseClick", (pos: Vector) => {
      this._clickedAt = pos;
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
}