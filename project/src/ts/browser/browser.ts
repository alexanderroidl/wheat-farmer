
import Canvas from "../core/canvas";
import Vector from "../core/vector";
import Gui from "./gui";
import Mouse from "./mouse";

export default class Browser {
  private _canvas: Canvas[] = [];
  private _mouse: Mouse = new Mouse();
  private _gui: Gui = new Gui(this._mouse);
  private _windowSize: Vector = new Vector(window.innerWidth, window.innerHeight);

  public static get debug (): boolean {
    return Boolean(Browser.getParameter("debug"));
  }

  public get gui (): Gui {
    return this._gui;
  }

  public get mouse (): Mouse {
    return this._mouse;
  }

  public get windowSize (): Vector {
    return this._windowSize;
  }

  // ESLint rule for empty functions is disabled here because these are meant to be overwritten later on
  /* eslint-disable @typescript-eslint/no-empty-function */
  public onScroll = (delta: number): void => {};
  public onMouseDown = (pos: Vector): void => {};
  public onMouseUp = (pos: Vector): void => {};
  public onMouseMove = (pos: Vector): void => {};
  public onMouseClick = (pos: Vector): void => {};
  public onLoaded = (): void => {};
  public onResize = (size: Vector, oldSize: Vector): void => {};
  public onKeyDown = (keyCode: number, code: string): void => {};
  public onKeyUp = (keyCode: number, code: string): void => {};
  public onTouchStart = (pos: Vector): void => {};
  public onTouchMove = (pos: Vector): void => {};
  public onTouchCancel = (pos: Vector): void => {};
  public onTouchEnd = (pos: Vector): void => {};
  /* eslint-enable @typescript-eslint/no-empty-function */

  /**
   * Constructor
   */
  constructor () {
    this.setupEvents();
  }

  /**
   * On scroll
   * @param delta Scrolling delta value
   */
  private _onScroll (delta: number): void {
    this.onScroll(delta);
  }

  /**
   * On mouse down
   * @param {Vector} pos Screen coordinates
   */
  private _onMouseDown (pos: Vector): void {
    this._mouse.pressed = true;

    this.onMouseDown(pos);
  }

  /**
   * On mouse up
   * @param {Vector} pos Screen coordinates
   */
  private _onMouseUp (pos: Vector): void {
    this._mouse.pressed = false;

    this.onMouseUp(pos);
  }

  /**
   * On mouse move
   * @param {Vector} pos Screen coordinates
   */
  private _onMouseMove (pos: Vector): void {
    this._mouse.position.x = pos.x;
    this._mouse.position.y = pos.y;

    this.onMouseMove(pos);
  }

  /**
   * On mouse click
   * @param {Vector} pos Screen coordinates
   */
  private _onMouseClick (pos: Vector): void {
    this.onMouseClick(pos);
  }

  /**
   * On window loaded
   */
  private _onLoaded (): void {
    this._windowSize = new Vector(window.innerWidth, window.innerHeight);
    this.updateRendererCanvasSize();

    this.onLoaded();
  }

  /**
   * On window resize
   * @param {Vector} newSize
   * @param {Vector} oldSize
   */
  private _onResize (newSize: Vector, oldSize: Vector): void {
    this._windowSize = new Vector(window.innerWidth, window.innerHeight);

    this.updateRendererCanvasSize();

    this.onResize(newSize, oldSize);
  }

  /**
   * On key down
   * @param {number} keyCode
   * @param {string} code
   */
  private _onKeyDown (keyCode: number, code: string): void {
    this.onKeyDown(keyCode, code);
  }

  /**
   * On key up
   * @param {number} keyCode
   * @param {string} code
   */
  private _onKeyUp (keyCode: number, code: string): void {
    this.onKeyUp(keyCode, code);
  }

  /**
   * On touch start
   * @param {Vector} pos Screen coordinates
   */
  private _onTouchStart (pos: Vector): void {
    this.onTouchStart(pos);
  }

  /**
   * On touch move
   * @param {Vector} pos Screen coordinates
   */
  private _onTouchMove (pos: Vector): void {
    this.onTouchMove(pos);
  }

  /**
   * On touch cancel
   * @param {Vector} pos Screen coordinates
   */
  private _onTouchCancel (pos: Vector): void {
    this.onTouchCancel(pos);
  }

  /**
   * On touch end
   * @param {Vector} pos Screen coordinates
   */
  private _onTouchEnd (pos: Vector): void {
    this.onTouchEnd(pos);
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
   * Initially setup renderer canvas
   * @returns {CanvasRenderingContext2D}
   */
  public initializeRendererCanvas (id: string | null = null): CanvasRenderingContext2D {
    const canvas = new Canvas();
    this._canvas.push(canvas);
    
    this.updateRendererCanvasSize();

    const canvases = document.body.querySelectorAll("canvas");
    if (canvases.length) {
      const lastCanvas = canvases[canvases.length - 1];
      lastCanvas.parentNode?.insertBefore(canvas.element, lastCanvas.nextSibling);
    } else {
      document.body.prepend(canvas.element);
    }

    if (id != null) {
      canvas.element.id = id;
    }

    if (!canvas.ctx) {
      throw Error("Canvas 2d context not found");
    }
    
    return canvas.ctx;
  }

  /**
   * Update renderer's canvas size to current window dimensions
   */
  private updateRendererCanvasSize (): void {
    this._canvas = this._canvas.filter(c => Boolean(c.element));

    for (const canvas of this._canvas) {
      canvas.width = this.windowSize.x;
      canvas.height = this.windowSize.y;
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
  public static getParameter (name: string): string | null {
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
}