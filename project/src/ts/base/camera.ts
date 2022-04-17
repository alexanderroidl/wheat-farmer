import { Container, ObservablePoint } from "pixi.js";
import Vector from "../core/vector";
import Graphics from "./graphics";

export class Camera extends Container {
  public readonly defaultZoom = 1;
  public readonly minZoom = 0.25;

  private _zoom!: number;

  public get z (): number {
    return this._zoom;
  }

  public get zoom (): number {
    return this._zoom;
  }

  public set zoom (zoom: number) {
    zoom = zoom < this.minZoom ? this.minZoom : zoom;
    this._zoom = zoom;
    this.scale.set(Graphics.SQUARE_SIZE * zoom);
  }

  constructor () {
    super();

    this.zoom = this.defaultZoom;

    this.position = new ObservablePoint(() => {
      this.pivot.set(this.x, this.y);
    }, this);
  }

  public move (x: number | Vector, y?: number): void {
    let position = new Vector(this.position.x, this.position.y);
    position = position.add(x, y);
    this.position.set(position.x, position.y);
  }

  public worldPosFromScreen (screenPos: Vector): Vector {
    return new Vector(
      (screenPos.x - window.innerWidth / 2) / this.scale.x + this.position.x,
      (screenPos.y - window.innerHeight / 2) / this.scale.y + this.position.y
    );
  }
}