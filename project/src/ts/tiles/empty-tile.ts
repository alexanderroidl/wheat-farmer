import Renderer from "core/renderer";
import Tile from "./tile";
import Vector from "../core/vector";

export default class EmptyTile extends Tile {
    public static readonly COLOR = "#ebb434";
    public name: string = "Empty";
    public timeCreated: number = Date.now();

    public get backgroundColor (): string | null {
      return this.getDamagedHexColor(EmptyTile.COLOR);
    }

    public get textColor (): string | null {
      return "#666666";
    }
    
    public getChar (preview: boolean = false): string | null {
      return "x";
    }

    public onClicked (): void {
      // TODO: Implement logic
    }

    /* eslint-disable-next-line max-params */
    public renderLatest (renderer: Renderer, params: {
      ctx: CanvasRenderingContext2D;
      worldPosition: Vector;
      isHovered?: boolean;
    }): void {
      super.renderLatest(renderer, params);
    }
}