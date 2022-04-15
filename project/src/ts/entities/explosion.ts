import MoveableSprite from "../core/moveable-sprite";
import { Texture, FrameObject } from "pixi.js";
import Entity from "./entity";

export default class ExplosionEntity extends Entity {
  public static readonly timeToExplode = 175;
  public static readonly textureNames = [
    "explosion 0",
    "explosion 1",
    "explosion 2"
  ];
  public static readonly frameTime = ExplosionEntity.timeToExplode / ExplosionEntity.textureNames.length;

  public name: string = "Explosion";
  public loop: boolean = false;
  public completed: boolean = false;

  public static getFrameObjects (textures: Texture[]): FrameObject[] {
    return MoveableSprite.getFrameObjects(textures, ExplosionEntity.frameTime);
  }

  constructor (textures: Texture[]) {
    super(ExplosionEntity.getFrameObjects(textures));

    this.play();
    this.onComplete = () => {
      this.completed = true;
    };
  }
}