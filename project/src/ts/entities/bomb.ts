import Entity from "./entity";
import { FrameObject, Texture } from "pixi.js";
import MoveableSprite from "../core/moveable-sprite";

export default class BombEntity extends Entity {
  public static readonly explodeTime = 1000;
  public static readonly maxExplosionRadius = 2;
  public static readonly textureNames: string[] = [
    "bomb 0",
    "bomb 1",
    "bomb 2",
    "bomb 3"
  ];
  public static readonly frameTime: number = BombEntity.explodeTime / BombEntity.textureNames.length;

  public name: string = "Bomb";

  public get explosionProgress (): number {
    return this.currentFrame / (this.totalFrames - 1);
  }

  public get hasStartedExploding (): boolean {
    return this.explosionProgress > 0;
  }

  public get hasCompletedExplosion (): boolean {
    return this.explosionProgress === 1;
  }

  public static getFrameObjects (textures: Texture[]): FrameObject[] {
    return MoveableSprite.getFrameObjects(textures, BombEntity.frameTime);
  }

  constructor (textures: Texture[]) {
    super(BombEntity.getFrameObjects(textures));
  }

  public updateEntity (delta: number): void {
    super.updateEntity(delta);
  }

  public ignite (): void {
    this.play();
  }
}