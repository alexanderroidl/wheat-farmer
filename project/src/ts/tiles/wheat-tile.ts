import { FrameObject } from "pixi.js";
import { Textures } from "../base/textures";
import BitMath from "../core/bit-math";
import MoveableSprite from "../core/moveable-sprite";
import ITradeable from "../interfaces/tradeable";
import Tile from "./tile";

export default class WheatTile extends Tile implements ITradeable {
  public static readonly growthTime = 25 * 1000;

  public readonly name: string = "Wheat";
  public readonly buyPrice: number = 0;
  public readonly sellPrice: number = 0;
  public readonly minSeedDrop = 0;
  public readonly maxSeedDrop = 3;
  public loop: boolean = false;

  public get growthState (): number {
    return this.currentFrame / (this.totalFrames - 1);
  }

  public static getFrameObjects (): FrameObject[] {
    const frameTime = WheatTile.growthTime / Textures.wheat.length;
    return MoveableSprite.getFrameObjects(Textures.wheat, frameTime);
  }
  
  constructor () {
    super(WheatTile.getFrameObjects());
    
    this.play();
  }
  
  public getChar (preview: boolean = false): string | null {
    return preview ? "🌱" : null;
  }
  
  public dropSeeds (): number {
    return BitMath.floor(Math.random() * (this.maxSeedDrop - this.minSeedDrop + 1)) + this.minSeedDrop;
  }
}