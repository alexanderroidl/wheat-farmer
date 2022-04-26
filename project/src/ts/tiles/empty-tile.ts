import { Texture } from "@pixi/core";
import Tile from "./tile";

export default class EmptyTile extends Tile {
  public readonly name: string = "Empty";
  public outlineOnHover: boolean = false;

  constructor () {
    super([Texture.EMPTY]);
  }
}