import events from "events";
import Vector from "../core/vector";

export declare interface Camera {
  on(event: "moved", listener: (position: Vector) => void): this;
  on(event: "zoomed", listener: (zoom: number) => void): this;
  on(event: string, listener: () => void): this;
}

export class Camera extends events.EventEmitter {
  public static readonly DEFAULT_ZOOM = 1;
  public static readonly MIN_ZOOM = 0.25;
  public static readonly MAX_ZOOM = 4;

  private _position: Vector = new Vector(0);
  private _zoom: number = Camera.DEFAULT_ZOOM;

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
    zoom = zoom < Camera.MIN_ZOOM ? Camera.MIN_ZOOM : zoom;
    zoom = zoom > Camera.MAX_ZOOM ? Camera.MAX_ZOOM : zoom;
    
    if (this.z !== zoom) {
      this.emit("zoomed", zoom);
    }
    this._zoom = zoom;
  }

  public get position (): Vector {
    return this._position;
  }

  public set position (position: Vector) {
    if (this._position.x !== position.x || this._position.y !== position.y) {
      this.emit("moved", position);
    }
    this._position = position;
  }

  public move (x: number | Vector, y?: number): void {
    this.position = this.position.add(x, y);
  }
}