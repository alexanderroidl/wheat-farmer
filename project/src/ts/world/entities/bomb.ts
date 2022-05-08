import { FrameObject } from "pixi.js";
import { Textures } from "@graphics/textures";
import MoveableSprite from "@graphics/moveable-sprite";
import Entity from "./entity";

export default class BombEntity extends Entity {
  public static readonly explodeTime = 1000;
  public static readonly maxExplosionRadius = 2;

  public readonly name: string = "Bomb";

  constructor () {
    super(BombEntity.getFrameObjects());
  }

  public get explosionProgress (): number {
    return this.currentFrame / (this.totalFrames - 1);
  }

  public get hasStartedExploding (): boolean {
    return this.explosionProgress > 0;
  }

  public get hasCompletedExplosion (): boolean {
    return this.explosionProgress === 1;
  }

  public static getFrameObjects (): FrameObject[] {
    const frameTime = BombEntity.explodeTime / Textures.bomb.length;
    return MoveableSprite.getFrameObjects(Textures.bomb, frameTime);
  }

  public updateEntity (delta: number): void {
    super.updateEntity(delta);
  }

  public ignite (): void {
    this.play();
  }
}