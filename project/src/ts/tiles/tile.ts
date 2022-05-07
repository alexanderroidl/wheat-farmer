import DamageEntity from "@entities/damage";
import { GraphicsLayer } from "../base/graphics";
import MoveableSprite from "../core/moveable-sprite";

export default abstract class Tile extends MoveableSprite {
  public static readonly DAMAGE_HEAL_TIME = 60 * 1000;
  public static readonly COLOR: string = "";

  public layer: GraphicsLayer = GraphicsLayer.Tiles;
  public age: number = 0;
  protected _damageEntities: DamageEntity[] = [];
  private _damage: number = 0;
  public abstract readonly name: string;

  public get char (): string | null {
    return null;
  }

  public get damageEntities () {
    return this._damageEntities;
  }

  public get damage () {
    return this._damage;
  }

  public set damage (damage: number) {
    this._damage = damage < 0 ? 0 : damage > 1 ? 1 : damage;
  }

  public addDamageSprites (...damageEntities: DamageEntity[]): void {
    if (damageEntities.length) {
      this._damageEntities.push(...damageEntities);
      this.addChild(...damageEntities);
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
    for (const damageEntity of this._damageEntities) {
      damageEntity.alpha = this.damage * 0.5;

      // Remove damage sprite as child if alpha is zero
      if (damageEntity.alpha <= 0 && !damageEntity.destroyed) {
        this.removeChild(damageEntity);
        damageEntity.destroy();
      }
    }

    this._damageEntities = this._damageEntities.filter((damageEntity: DamageEntity) => {
      return !damageEntity.destroyed;
    });
  }
}