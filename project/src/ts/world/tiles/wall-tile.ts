import ITradeable from "@world/tradeable.interface";
import Tile from "./tile";

export default class WallTile extends Tile implements ITradeable {
  public readonly name: string = "Wall";
  public readonly buyPrice: number = 10;
  public readonly sellPrice: number = 4;

  public get char (): string | null {
    return "🚫";
  }

  public hasCollision (): boolean {
    return true;
  }
}