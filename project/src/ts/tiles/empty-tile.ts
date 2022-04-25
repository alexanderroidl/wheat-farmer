import { Texture } from "@pixi/core";
import Tile from "./tile";

export default class EmptyTile extends Tile {
    public name: string = "Empty";
    
    constructor () {
      super([Texture.EMPTY]);
    }

    public updateTile (deltaTime: number): void {
      super.updateTile(deltaTime);
    }
}