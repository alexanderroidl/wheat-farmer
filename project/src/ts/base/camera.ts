// import events from "events";
import { Container, ObservablePoint } from "pixi.js";
import Vector from "../core/vector";
import Graphics from "./graphics";

// export declare interface Camera {
//   on(event: "moved", listener: (position: Vector) => void): this;
//   on(event: "zoomed", listener: (zoom: number) => void): this;
//   on(event: string, listener: () => void): this;
// }

export class Camera extends Container {
  public readonly defaultZoom = 1;
  public readonly minZoom = 0.25;

  private _zoom: number = this.defaultZoom;

  public get zoom (): number {
    return this._zoom;
  }

  public set zoom (zoom: number) {
    if (this._zoom < this.minZoom) {
      return;
    }

    this._zoom = zoom;
    this.scale.set(Graphics.SQUARE_SIZE * zoom);
  }

  constructor (screenSize: Vector) {
    super();

    this.position = new ObservablePoint(() => {
      this.pivot.set(this.x, this.y);
    }, this);

    this.screenResized(screenSize);
  }

  public screenResized (size: Vector) {
    this.position.set(size.x / 2, size.y / 2);
  }

  public worldPosFromScreen (screenPos: Vector): Vector {
    return new Vector(
      (screenPos.x - window.innerWidth / 2) / this.scale.x + this.position.x,
      (screenPos.y - window.innerHeight / 2) / this.scale.y + this.position.y
    );
  }
}