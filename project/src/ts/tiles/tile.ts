import { DisplayObject } from "pixi.js";
import MoveableSprite from "../core/moveable-sprite";
import ITile from "../interfaces/tile";

export default class Tile extends MoveableSprite implements ITile {
  public static readonly DAMAGE_HEAL_TIME = 60 * 1000;
  public static readonly COLOR: string = "";

  public age: number = 0;
  protected _damageSprites: DisplayObject[] = [];
  private _damage: number = 0;

  public get damage (): number {
    return this._damage;
  }

  public set damage (damage: number) {
    this._damage = damage < 0 ? 0 : damage;
  }

  public get textureId (): number {
    return 0;
  }

  public get zIndex (): number {
    return 999;
  }

  public addDamageSprites (...damageSprites: DisplayObject[]): void {
    if (damageSprites.length) {
      this._damageSprites.push(...damageSprites);
      for (const damageSprite of damageSprites) {
        damageSprite.zIndex = 5555;
      }
      this.addChild(...damageSprites);
    }
  }

  public getDamageSprites (): DisplayObject[] {
    return this._damageSprites;
  }

  public hasCollision (): boolean {
    return false;
  }

  public getChar (preview: boolean = false): string | null {
    return null;
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