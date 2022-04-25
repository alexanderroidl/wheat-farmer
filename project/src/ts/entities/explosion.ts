import { FrameObject } from "pixi.js";
import { Textures } from "../base/textures";
import MoveableSprite from "../core/moveable-sprite";
import Entity from "./entity";

export default class ExplosionEntity extends Entity {
  public static readonly timeToExplode = 175;

  public name: string = "Explosion";
  public loop: boolean = false;
  public completed: boolean = false;

  public static getFrameObjects (): FrameObject[] {
    const frameTime = ExplosionEntity.timeToExplode / Textures.explosion.length;
    return MoveableSprite.getFrameObjects(Textures.explosion, frameTime);
  }

  constructor () {
    super(ExplosionEntity.getFrameObjects());

    this.play();
    this.onComplete = () => {
      this.completed = true;
    };
  }
}