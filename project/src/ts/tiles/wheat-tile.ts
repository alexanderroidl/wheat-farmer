import Tile from "./tile";
import BitMath from "../core/bit-math";
import ITradeable from "../interfaces/tradeable";
import { FrameObject, Texture } from "pixi.js";
import MoveableSprite from "../core/moveable-sprite";

export default class WheatTile extends Tile implements ITradeable {
  public static readonly textureNames: string[] = [...Array(11)].map((_v, i) => `wheat ${i}`);
  public static readonly growthTime = 25 * 1000;
  public static readonly frameTime: number = WheatTile.growthTime / WheatTile.textureNames.length;

  public readonly buyPrice: number = 0;
  public readonly sellPrice: number = 0;
  public readonly minSeedDrop = 0;
  public readonly maxSeedDrop = 3;
  
  public name: string = "Wheat";
  public loop: boolean = false;

  public get growthState (): number {
    return this.currentFrame / (this.totalFrames - 1);
  }

  public static getFrameObjects (textures: Texture[]): FrameObject[] {
    return MoveableSprite.getFrameObjects(textures, WheatTile.frameTime);
  }
  
  constructor (textures: Texture[]) {
    super(WheatTile.getFrameObjects(textures));

    this.play();
  }
  
  public getChar (preview: boolean = false): string | null {
    return preview ? "🌱" : null;
  }
  
  public dropSeeds (): number {
    return BitMath.floor(Math.random() * (this.maxSeedDrop - this.minSeedDrop + 1)) + this.minSeedDrop;
  }
}