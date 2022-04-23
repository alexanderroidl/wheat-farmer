import events from "events";
import { ObservablePoint } from "pixi.js";
import Vector from "../core/vector";
import Graphics from "./graphics";

export declare interface Camera {
  on(event: "moved", listener: (position: Vector) => void): this;
  on(event: "zoomed", listener: (zoom: number) => void): this;
  on(event: string, listener: () => void): this;
}

export class Camera extends events.EventEmitter {
  public readonly defaultZoom = 1;
  public readonly minZoom = 0.25;

  private _position: ObservablePoint;
  private _zoom: number;

  public get x (): number {
    return this._position.x;
  }

  public set x (x: number) {
    this._position.x = x;
  }

  public get y (): number {
    return this._position.y;
  }

  public set y (y: number) {
    this._position.y = y;
  }

  public get z (): number {
    return this._zoom;
  }

  public set z (zoom: number) {
    zoom = zoom < this.minZoom ? this.minZoom : zoom;
    if (this.z !== zoom) {
      this.emit("zoomed", zoom);
    }
    this._zoom = zoom;
  }

  public get position (): ObservablePoint {
    return this._position;
  }

  constructor () {
    super();

    this._zoom = this.defaultZoom;

    this._position = new ObservablePoint(() => {
      this.emit("moved", new Vector(this._position.x, this.position.y));
    }, this);
  }

  public move (x: number | Vector, y?: number): void {
    const position = new Vector(this.x, this.y).add(new Vector(x, y));
    this._position.set(position.x, position.y);
  }

  public worldPosFromScreen (screenPos: Vector): Vector {
    return new Vector(
      (screenPos.x - window.innerWidth / 2) / (Graphics.SQUARE_SIZE * this.z) + this.x,
      (screenPos.y - window.innerHeight / 2) / (Graphics.SQUARE_SIZE * this.z) + this.y
    );
  }
}