import BitMath from "@core/bit-math";
import Easings from "@core/easings";
import MoveableSprite from "@core/moveable-sprite";
import Vector from "@core/vector";
import Graphics from "./graphics";
import { Textures } from "./textures";

export class DamageSprite extends MoveableSprite {
  public interactive: boolean = true;
  public toBeDestroyed: boolean = false;

  public get hovered (): boolean {
    return false;
  }

  constructor (damage: number) {
    const randomTextureIndex = BitMath.floor(Math.random() * Textures.damage.length);
    const randomTexture = Textures.damage[randomTextureIndex];
    super([randomTexture]);
    
    const offset = new Vector(Math.random(), Math.random()).substract(0.5).multiply(Graphics.SQUARE_SIZE);
    const size = 1 + Easings.easeInCubic(Math.random()) * 2 * damage;
    
    this.scale.set(size);
    this.anchor.set(0.5);
    this.alpha = Math.random() * 0.65 * damage;
    this.rotation = Math.random() * Math.PI * 2;
    this.position.set(offset.x, offset.y);
  }
}