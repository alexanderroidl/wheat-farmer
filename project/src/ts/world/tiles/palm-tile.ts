import Vector from "@core/vector";
import { Textures } from "@graphics/textures";
import ITradeable from "@world/tradeable.interface";
import Tile from "./tile";
// import Vector from "@core/vector";

export default class PalmTile extends Tile implements ITradeable {
  public readonly name: string = "Palm Tree";
  public readonly buyPrice: number = 0;
  public readonly sellPrice: number = 0;

  // protected dimensions: Vector;

  constructor () {
  //   let randomTextureIndex = Math.floor(Textures.palmTree.length * Math.random());
  //   randomTextureIndex = 0;

    super([Textures.empty]);

    this.dimensions = new Vector(1, 2);
    this.anchor.set(0, 0.5);
    this.textures = [Textures.palmTree[0]];
  }

  public get char (): string | null {
    return "🌱";
  }
}