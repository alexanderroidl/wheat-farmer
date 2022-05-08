// import { AlphaFilter } from "@pixi/filter-alpha";
import { Textures } from "@graphics/textures";
import Tile from "./tile";

export default class EmptyTile extends Tile {
  public readonly name: string = "Empty";
  public outlineOnHover: boolean = false;
  public buttonMode: boolean = true;
  // private _alphaFilter: AlphaFilter = new AlphaFilter(0.5);

  constructor () {
    super([Textures.empty, Textures.wheat[0]]);
  }

  public updateTile (d: number): void {
    super.updateTile(d);

    const textureFrameIndex = this.hovered ? 1 : 0;
    if (textureFrameIndex !== this.currentFrame) {
      this.gotoAndStop(textureFrameIndex);
      // this.toggleFilter(this._alphaFilter, this.currentFrame === 1);
    }
  }
}