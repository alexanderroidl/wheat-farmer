
import events from "events";
import * as PIXI from "pixi.js";
import Vector from "../core/vector";
import Gui from "./gui";

export class BrowserMouse {
  public position: Vector = new Vector(0, 0);
  public pressed: boolean = false;
}

export declare interface Browser {
  on(event: "scroll", listener: (delta: number) => void): this;
  on(event: "mouseDown", listener: (pos: Vector) => void): this;
  on(event: "mouseUp", listener: (pos: Vector) => void): this;
  on(event: "mouseMove", listener: (pos: Vector) => void): this;
  on(event: "mouseClick", listener: (pos: Vector) => void): this;
  on(event: "loaded", listener: () => void): this;
  on(event: "resize", listener: (size: Vector, oldSize: Vector) => void): this;
  on(event: "keyDown", listener: (keyCode: number, code: string) => void): this;
  on(event: "keyUp", listener: (keyCode: number, code: string) => void): this;
  on(event: "touchStart", listener: (pos: Vector) => void): this;
  on(event: "touchMove", listener: (pos: Vector) => void): this;
  on(event: "touchCancel", listener: (pos: Vector) => void): this;
  on(event: "touchEnd", listener: (pos: Vector) => void): this;
  on(event: string, listener: () => void): this;
}

export class Browser extends events.EventEmitter {
  private _mouse: BrowserMouse = new BrowserMouse();
  private _gui: Gui = new Gui(this._mouse);
  private _windowSize: Vector = new Vector(window.innerWidth, window.innerHeight);

  public static get debug (): boolean {
    return Boolean(Browser.getURLParameter("debug"));
  }

  public get gui (): Gui {
    return this._gui;
  }

  public get mouse (): BrowserMouse {
    return this._mouse;
  }

  public get windowSize (): Vector {
    return this._windowSize;
  }

  /**
   * Constructor
   */
  constructor () {
    super();
    this.setupEvents();
  }

  /**
   * On scroll
   * @param delta Scrolling delta value
   */
  private _onScroll (delta: number): void {
    this.emit("scroll", delta);
  }

  /**
   * On mouse down
   * @param {Vector} pos Screen coordinates
   */
  private _onMouseDown (pos: Vector): void {
    this._mouse.pressed = true;

    this.emit("mouseDown", pos);
  }

  /**
   * On mouse up
   * @param {Vector} pos Screen coordinates
   */
  private _onMouseUp (pos: Vector): void {
    this._mouse.pressed = false;

    this.emit("mouseUp", pos);
  }

  /**
   * On mouse move
   * @param {Vector} pos Screen coordinates
   */
  private _onMouseMove (pos: Vector): void {
    this._mouse.position.x = pos.x;
    this._mouse.position.y = pos.y;

    this.emit("mouseMove", pos);
  }

  /**
   * On mouse click
   * @param {Vector} pos Screen coordinates
   */
  private _onMouseClick (pos: Vector): void {
    this.emit("mouseClick", pos);
  }

  /**
   * On window loaded
   */
  private _onLoaded (): void {
    this._windowSize = new Vector(window.innerWidth, window.innerHeight);
    this.emit("loaded");
  }

  /**
   * On window resize
   * @param {Vector} newSize
   * @param {Vector} oldSize
   */
  private _onResize (newSize: Vector, oldSize: Vector): void {
    this._windowSize = new Vector(window.innerWidth, window.innerHeight);
    this.emit("resize", newSize, oldSize);
  }

  /**
   * On key down
   * @param {number} keyCode
   * @param {string} code
   */
  private _onKeyDown (keyCode: number, code: string): void {
    this.emit("keyDown", keyCode, code);
  }

  /**
   * On key up
   * @param {number} keyCode
   * @param {string} code
   */
  private _onKeyUp (keyCode: number, code: string): void {
    this.emit("keyUp", keyCode, code);
  }

  /**
   * On touch start
   * @param {Vector} pos Screen coordinates
   */
  private _onTouchStart (pos: Vector): void {
    this.emit("touchStart", pos);
  }

  /**
   * On touch move
   * @param {Vector} pos Screen coordinates
   */
  private _onTouchMove (pos: Vector): void {
    this.emit("touchMove", pos);
  }

  /**
   * On touch cancel
   * @param {Vector} pos Screen coordinates
   */
  private _onTouchCancel (pos: Vector): void {
    this.emit("touchCancel", pos);
  }

  /**
   * On touch end
   * @param {Vector} pos Screen coordinates
   */
  private _onTouchEnd (pos: Vector): void {
    this.emit("touchEnd", pos);
  }

  /**
   * Setup browser event listeners
   */
  private setupEvents (): void {
    // The flag that determines whether the wheel event is supported
    let supportsWheel = false;

    /* eslint-disable @typescript-eslint/no-explicit-any */
    // The function that will run when the events are triggered
    const wheelHandler = (e: any) => {
      if (e.type === "wheel") supportsWheel = true;
      else if (supportsWheel) return;

      const delta = ((e.deltaY || -e.wheelDelta || e.detail) >> 10) || 1;
      this._onScroll(delta);
    };
    /* eslint-enable @typescript-eslint/no-explicit-any */

    // Add the event listeners for each event.
    document.addEventListener("wheel", wheelHandler);
    document.addEventListener("mousewheel", wheelHandler);
    document.addEventListener("DOMMouseScroll", wheelHandler);

    // On mouse down
    document.addEventListener("mousedown", (e) => {
      this._onMouseDown(new Vector(e.screenX, e.screenY));
    });

    // On mouse up
    document.addEventListener("mouseup", (e) => {
      this._onMouseUp(new Vector(e.screenX, e.screenY));
    });

    // On mouse move
    document.addEventListener("mousemove", (e) => {
      this._onMouseMove(new Vector(e.clientX, e.clientY));
    });

    // On click
    document.addEventListener("click", (e) => {
      this._onMouseClick(this._mouse.position);
    });

    // On window load
    window.addEventListener("load", () => {
      this._onLoaded();
    });

    // On window resize
    window.addEventListener("resize", () => {
      const currentWindowSize = new Vector(window.innerWidth, window.innerHeight);
      this._onResize(currentWindowSize, this._windowSize);
    });

    // On key down
    document.addEventListener("keydown", (e: KeyboardEvent) => {
      this._onKeyDown(e.keyCode, e.code);
    });

    // On key up
    document.addEventListener("keyup", (e: KeyboardEvent) => {
      this._onKeyUp(e.keyCode, e.code);
    });

    // Mobile-only events
    if (Browser.isMobile) {
      // On touch start
      document.body.addEventListener("touchstart", (e: TouchEvent) => {
        // TODO: Implement screen coordinates
        this._onTouchStart(new Vector(0, 0));
      });

      // On touch end
      document.body.addEventListener("touchend", (e: TouchEvent) => {
        // TODO: Implement screen coordinates
        this._onTouchEnd(new Vector(0, 0));
      });

      // On touch move
      document.body.addEventListener("touchmove", (e: TouchEvent) => {
        // TODO: Implement screen coordinates
        this._onTouchMove(new Vector(0, 0));
      });

      // On touch cancel
      document.body.addEventListener("touchcancel", (e: TouchEvent) => {
        // TODO: Implement screen coordinates
        this._onTouchCancel(new Vector(0, 0));
      });
    }
  }

  /**
   * Invoke window alert
   * @param text Text to alert
   */
  public static alert (text: string): void {
    window.alert(text);
  }

  /**
   * Retrieve value of URL GET parameter (Source: https://stackoverflow.com/a/5448595/11379072)
   * @param {string} name GET parameter name
   * @returns {string|null}
   */
  public static getURLParameter (name: string): string | null {
    let result: string | null = null;
    let tmp = [];

    const parameters = location.search.substr(1).split("&");
    for (const parameter of parameters) {
      tmp = parameter.split("=");

      if (tmp[0] === name) {
        result = decodeURIComponent(tmp[1]);
      }
    }

    return result;
  }

  /**
   * Check if user agent is mobile device
   * @returns {boolean}
   */
  public static get isMobile (): boolean {
    const toMatch = [
      /Android/i,
      /webOS/i,
      /iPhone/i,
      /iPad/i,
      /iPod/i,
      /BlackBerry/i,
      /Windows Phone/i
    ];

    return toMatch.some((toMatchItem) => {
      return navigator.userAgent.match(toMatchItem);
    });
  }

  public static addPixi (pixi: PIXI.Application): void {
    document.body.append(pixi.view);
  }

  public static toggleTitleScreen (toggle: boolean): void {
    document.body.classList.toggle("titlescreen", toggle);
  }
}