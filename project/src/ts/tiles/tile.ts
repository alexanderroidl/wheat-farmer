import { DisplayObject } from "pixi.js";
import { GraphicsLayer } from "../base/graphics";
import MoveableSprite from "../core/moveable-sprite";

export default abstract class Tile extends MoveableSprite {
  public static readonly DAMAGE_HEAL_TIME = 60 * 1000;
  public static readonly COLOR: string = "";

  public abstract readonly name: string;
  public layer: GraphicsLayer = GraphicsLayer.Tiles;
  public age: number = 0;
  protected _damageSprites: MoveableSprite[] = [];
  private _damage: number = 0;

  public get damage (): number {
    return this._damage;
  }

  public set damage (damage: number) {
    this._damage = damage < 0 ? 0 : damage;
  }

  public get char (): string | null {
    return null;
  }

  public addDamageSprites (...damageSprites: MoveableSprite[]): void {
    if (damageSprites.length) {
      this._damageSprites.push(...damageSprites);
      this.addChild(...damageSprites);
    }
  }

  public getDamageSprites (): MoveableSprite[] {
    return this._damageSprites;
  }

  public hasCollision (): boolean {
    return false;
  }

  public updateTile (deltaTime: number): void {
    super.updateSprite(deltaTime);

    this.age += deltaTime;
    this.damage -= deltaTime / (Tile.DAMAGE_HEAL_TIME * 100);

    // Iterate damage tiles
    for (const damageSprite of this._damageSprites) {
      damageSprite.alpha -= this.damage / deltaTime / 100;

      // Remove damage sprite as child if alpha is zero
      if (damageSprite.alpha <= 0) {
        this.removeChild(damageSprite);
      }
    }

    this._damageSprites = this._damageSprites.filter((sprite: DisplayObject) => {
      return Boolean(this.parent);
    });
  }
}