import { AnimatedSprite, FrameObject, Texture } from "pixi.js";
import Graphics from "../base/graphics";
import IRenderable from "../interfaces/renderable";
import Easings from "./easings";
import Vector from "./vector";

export default class MoveableSprite extends AnimatedSprite implements IRenderable {
  public speed: number = 0;
  public moveStartPosition: Vector | null = null;
  public moveStartDistance: number | null = null;
  public sourceFrames: string[] = [];
  private _moveTarget: Vector | null = null;

  public get textureId (): number {
    return 0;
  }

  public get renderOffset (): Vector {
    return new Vector(-this.pivot.x / this.parent.scale.x, -this.pivot.y / this.parent.scale.y);
  }

  public set renderOffset (offset: Vector) {
    this.pivot.set(-offset.x * this.parent.scale.x, -offset.y * this.parent.scale.y);
  }

  public get moveHasCompleted (): boolean {
    return this.moveTarget instanceof Vector && (this.x === this.moveTarget.x && this.y === this.moveTarget.y);
  }

  public get isMoving (): boolean {
    return this.speed > 0 && this.moveTarget instanceof Vector && !this.moveHasCompleted;
  }

  public get movedDistance (): number {
    if (!this.moveStartPosition) {
      return 0;
    }
    return this.moveStartPosition.substract(this.x, this.y).length;
  }

  public set moveTarget (moveTarget: Vector | null) {
    this._moveTarget = moveTarget;

    if (moveTarget instanceof Vector) {
      this.moveStartPosition = new Vector(this.x, this.y);
      this.moveStartDistance = moveTarget.substract(this.x, this.y).length;
    } else {
      this.moveStartPosition = null;
      this.moveStartDistance = null;
    }
  }

  public get moveTarget (): Vector | null {
    return this._moveTarget;
  }

  public static getFrameObjects (textures: Texture[], time: number): FrameObject[] {
    return textures.map((texture: Texture): FrameObject => {
      return { texture, time };
    });
  }

  constructor (textures: Texture[] | FrameObject[]) {
    super(textures);

    this.scale.set(1.0 / Graphics.SQUARE_SIZE);
  }

  protected move (delta: number): Vector {
    // Entity has no assigned target
    if (this.moveTarget == null || this.moveStartDistance == null) {
      return new Vector(0);
    }

    let entitySpeed = this.speed * (delta / 1000);
    let distance = this.moveTarget.substract(this.x, this.y).length;

    const distanceProgress = distance / this.moveStartDistance;

    entitySpeed = entitySpeed * (1 + 2 * Easings.easeInOutQuart(1 - distanceProgress));

    if (distance <= entitySpeed) {
      distance = entitySpeed;
    }

    return this.moveTarget.substract(this.x, this.y).multiply(entitySpeed / distance);
  }

  public updateSprite (deltaTime: number): void {
    if (this.isMoving) {
      const moveDelta = this.move(deltaTime);
      
      this.x += moveDelta.x;
      this.y += moveDelta.y;
    }
  }
}