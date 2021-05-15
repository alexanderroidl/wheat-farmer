
import Vector from "../core/vector";
import Gui from "./gui";
import Mouse from "./mouse";

export default class Browser {
  private _mouse: Mouse = new Mouse();
  private _gui: Gui = new Gui(this._mouse);
  private _oldWindowSize: Vector = new Vector(window.innerWidth, window.innerHeight);

  public get gui (): Gui {
    return this._gui;
  }

  public get mouse (): Mouse {
    return this._mouse;
  }

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

  /* eslint-disable @typescript-eslint/no-empty-function */
  public onScroll = (delta: number): void => {};
  public onMouseDown = (pos: Vector): void => {};
  public onMouseUp = (pos: Vector): void => {};
  public onMouseMove = (pos: Vector): void => {};
  public onMouseClick = (pos: Vector): void => {};
  public onResize = (size: Vector, oldSize: Vector): void => {};
  public onKeyDown = (keyCode: number, code: string): void => {};
  public onKeyUp = (keyCode: number, code: string): void => {};
  public onTouchStart = (pos: Vector): void => {};
  public onTouchMove = (pos: Vector): void => {};
  public onTouchCancel = (pos: Vector): void => {};
  public onTouchEnd = (pos: Vector): void => {};
  /* eslint-enable @typescript-eslint/no-empty-function */

  constructor () {
    this.setupEvents();
  }

  private setupEvents (): void {
    // The flag that determines whether the wheel event is supported
    let supportsWheel = false;

    /* eslint-disable @typescript-eslint/no-explicit-any */
    // The function that will run when the events are triggered
    const wheelHandler = (e: any) => {
      if (e.type === "wheel") supportsWheel = true;
      else if (supportsWheel) return;

      const delta = ((e.deltaY || -e.wheelDelta || e.detail) >> 10) || 1;
      this.onScroll(delta);
    };
    /* eslint-enable @typescript-eslint/no-explicit-any */

    // Add the event listeners for each event.
    document.addEventListener("wheel", wheelHandler);
    document.addEventListener("mousewheel", wheelHandler);
    document.addEventListener("DOMMouseScroll", wheelHandler);

    // On mouse down
    document.addEventListener("mousedown", (e) => {
      this._mouse.pressed = true;
      this.onMouseDown(new Vector(e.screenX, e.screenY));
    });

    // On mouse up
    document.addEventListener("mouseup", (e) => {
      this._mouse.pressed = false;
      this.onMouseUp(new Vector(e.screenX, e.screenY));
    });

    // On mouse move
    document.addEventListener("mousemove", (e) => {
      this._mouse.position.x = e.clientX;
      this._mouse.position.y = e.clientY;

      this.onMouseMove(new Vector(e.clientX, e.clientY));
    });

    // On click
    document.addEventListener("click", (e) => {
      this.onMouseClick(this._mouse.position);
    });

    // On window load
    window.addEventListener("load", () => {
      this._oldWindowSize = new Vector(window.innerWidth, window.innerHeight);
    });

    // On window resize
    window.addEventListener("resize", () => {
      const currentWindowSize = new Vector(window.innerWidth, window.innerHeight);
      this.onResize(currentWindowSize, this._oldWindowSize);

      this._oldWindowSize = new Vector(window.innerWidth, window.innerHeight);
    });

    // On key down
    document.addEventListener("keydown", (e: KeyboardEvent) => {
      this.onKeyDown(e.keyCode, e.code);
    });

    // On key up
    document.addEventListener("keyup", (e: KeyboardEvent) => {
      this.onKeyUp(e.keyCode, e.code);
    });

    // Mobile-only events
    if (Browser.isMobile) {
      // On touch start
      document.body.addEventListener("touchstart", (e: TouchEvent) => {
        // TODO: Implement screen coordinates
        this.onTouchStart(new Vector(0, 0));
      });

      // On touch end
      document.body.addEventListener("touchend", (e: TouchEvent) => {
        // TODO: Implement screen coordinates
        this.onTouchEnd(new Vector(0, 0));
      });

      // On touch move
      document.body.addEventListener("touchmove", (e: TouchEvent) => {
        // TODO: Implement screen coordinates
        this.onTouchMove(new Vector(0, 0));
      });

      // On touch cancel
      document.body.addEventListener("touchcancel", (e: TouchEvent) => {
        // TODO: Implement screen coordinates
        this.onTouchCancel(new Vector(0, 0));
      });
    }
  }

  public static alert (text: string): void {
    window.alert(text);
  }

  public static getParameter (name: string): string | null {
    // Source: https://stackoverflow.com/a/5448595/11379072

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
}