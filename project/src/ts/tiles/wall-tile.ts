import TradeableInterface from "interfaces/tradeable-interface";
import Tile from "./tile";

export default class WallTile extends Tile implements TradeableInterface {
    public readonly buyPrice: number = 10;
    public readonly sellPrice: number = 4;

    public name: string = "Wall";

    public hasCollision (): boolean {
      return true;
    }
    
    public getChar (preview: boolean = false): string | null {
      if (preview) {
        return "🚫";
      }
      return null;
    }

    public getBackgroundColor (): string | null {
      return "#111111";
    }

    public getTextColor (): string | null {
      return null;
    }

    public onClicked (): void {
      // TODO: Implement logic
    }
}