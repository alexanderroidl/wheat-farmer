import Easings from "../../core/easings";
import BitMath from "../../core/bit-math";
import Entity from "../entity";

export default class BombEntity extends Entity {
  public static readonly EXPLODE_TIME = 3 * 1000;
  public static readonly MAX_EXPLOSION_RADIUS = 2;

  public readonly name: string = "Bomb";

  private _ignitedAt: number | null = null;

  public get textureId (): number {
    return 17 + BitMath.floor(7 * Easings.easeInExpo(this.explosionProgress));
  }

  public get explosionProgress (): number {
    if (this._ignitedAt === null) {
      return 0;
    }
      
    const progress = (Date.now() - this._ignitedAt) / BombEntity.EXPLODE_TIME;
    return progress > 1 ? 1 : progress;
  }

  public get hasStartedExploding (): boolean {
    return this._ignitedAt !== null;
  }

  public get hasCompletedExplosion (): boolean {
    return this.explosionProgress === 1;
  }

  public ignite (): void {
    this._ignitedAt = Date.now();
  }
}