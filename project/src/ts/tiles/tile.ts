import { DamageSprite } from "@base/damage-sprite";
import { GraphicsLayer } from "../base/graphics";
import MoveableSprite from "../core/moveable-sprite";

export default abstract class Tile extends MoveableSprite {
  public static readonly DAMAGE_HEAL_TIME = 60 * 1000;
  public static readonly COLOR: string = "";

  public abstract readonly name: string;
  public layer: GraphicsLayer = GraphicsLayer.Tiles;
  public age: number = 0;
  protected _damageSprites: DamageSprite[] = [];
  private _damage: number = 0;

  public get damage () {
    return this._damage;
  }

  public set damage (damage: number) {
    this._damage = damage < 0 ? 0 : damage > 1 ? 1 : damage;
  }

  public get char (): string | null {
    return null;
  }

  public get damageSprites () {
    return this._damageSprites;
  }

  public addDamageSprites (...damageSprites: DamageSprite[]): void {
    if (damageSprites.length) {
      this._damageSprites.push(...damageSprites);
      this.addChild(...damageSprites);
    }
  }

  public hasCollision (): boolean {
    return false;
  }

  public updateTile (deltaTime: number): void {
    super.updateSprite(deltaTime);

    this.age += deltaTime;
    this.damage -= deltaTime / Tile.DAMAGE_HEAL_TIME;

    // Iterate damage tiles
    for (const damageSprite of this._damageSprites) {
      damageSprite.alpha = this.damage * 0.5;

      // Remove damage sprite as child if alpha is zero
      if (damageSprite.alpha <= 0 && !damageSprite.destroyed) {
        this.removeChild(damageSprite);
        damageSprite.destroy();
      }
    }

    this._damageSprites = this._damageSprites.filter((damageSprite: DamageSprite) => {
      return !damageSprite.destroyed;
    });
  }
}