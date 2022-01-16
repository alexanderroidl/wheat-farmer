import Tile from "./tile";

export default class EmptyTile extends Tile {
    public static readonly COLOR = "#ebb434";
    public name: string = "Empty";
    public timeCreated: number = Date.now();

    public get textureId (): number {
      return 0;
    }

    public onClicked (): void {
      // TODO: Implement logic
    }
}