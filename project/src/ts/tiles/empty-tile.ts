import { Text, Texture } from "pixi.js";
import Tile from "./tile";

export default class EmptyTile extends Tile {
    public name: string = "Empty";

    public text: Text;

    constructor (textures: Texture[]) {
      super(textures);

      this.text = new Text("", {
        fontFamily: "Arial",
        fontSize: 10,
        fill: 0xff1010,
        align: "center"
      });

      this.addChild(this.text);
    }

    public updateTile (deltaTime: number): void {
      super.updateTile(deltaTime);
      this.text.text = `(${this.x}, ${this.y})`;
    }
}