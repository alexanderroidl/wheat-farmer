import { Textures } from "../base/textures";
import Tile from "./tile";

export default class EmptyTile extends Tile {
    public name: string = "Empty";
    
    constructor () {
      super([Textures.background]);
    }

    public updateTile (deltaTime: number): void {
      super.updateTile(deltaTime);
    }
}