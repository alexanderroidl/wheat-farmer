import ITradeable from "interfaces/tradeable";
import Tile from "./tile";

export default class WallTile extends Tile implements ITradeable {
  public readonly name: string = "Wall";
  public readonly buyPrice: number = 10;
  public readonly sellPrice: number = 4;
  
  public hasCollision (): boolean {
    return true;
  }
  
  public getChar (preview: boolean = false): string | null {
    if (preview) {
      return "🚫";
    }
    return null;
  }
}