import Vector from "@core/vector";
import { Graphics } from "pixi.js";

export class ProgressBar extends Graphics {
  public progress: number = 0;
  public color: number = 0x000000;
  public readonly size: Vector = new Vector(0.5, 0.07);

  constructor (color: number) {
    super();

    this.color = color;
  }

  public update (): void {
    this.clear();

    this.beginFill(0xFFFFFF);
    this.drawRect((1 - this.size.x) / 2, 0, this.size.x, this.size.y);

    this.beginFill(this.color);
    this.drawRect((1 - this.size.x) / 2, 0, this.size.x * this.progress, this.size.y);

    this.endFill();
  }
}