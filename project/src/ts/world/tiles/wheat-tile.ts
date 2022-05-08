import { Textures } from "@graphics/textures";
import BitMath from "@core/bit-math";
import ITradeable from "@world/tradeable.interface";
import Tile from "./tile";

export default class WheatTile extends Tile implements ITradeable {
  public static readonly GROWTH_TIME = 25 * 1000;

  public readonly name: string = "Wheat";
  public readonly buyPrice: number = 0;
  public readonly sellPrice: number = 0;
  public readonly minSeedDrop = 0;
  public readonly maxSeedDrop = 3;
  public loop: boolean = false;
  private _timeGrown: number = 0;

  constructor () {
    super(Textures.wheat);
  }

  public get growthRate (): number {
    return this._timeGrown / WheatTile.GROWTH_TIME * (1 - this.damage);
  }

  public get char (): string | null {
    return "🌱";
  }

  public dropSeeds (): number {
    return BitMath.floor(Math.random() * (this.maxSeedDrop - this.minSeedDrop + 1)) + this.minSeedDrop;
  }

  public updateTile (delta: number): void {
    super.updateTile(delta);

    if (this._timeGrown + delta > WheatTile.GROWTH_TIME) {
      this._timeGrown = WheatTile.GROWTH_TIME;
    } else {
      this._timeGrown += delta;
    }

    const targetFrame = Math.floor(this.growthRate * (this.totalFrames - 1));
    if (this.currentFrame !== targetFrame) {
      this.gotoAndStop(targetFrame);
    }


    if (this.growthRate < 1) {
      this.cursor = "progress";
    } else {
      this.cursor = "pointer";
    }
  }
}