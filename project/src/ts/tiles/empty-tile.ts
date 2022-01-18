import Renderer, { RendererLayer } from "../base/renderer";
import Vector from "../core/vector";
import Tile from "./tile";

export default class EmptyTile extends Tile {
    public static readonly COLOR = "#ebb434";
    public name: string = "Empty";
    public timeCreated: number = Date.now();

    public get textureId (): number {
      return 0;
    }

    public render (renderer: Renderer, params: {
      ctx: CanvasRenderingContext2D,
      layer: RendererLayer,
      worldPosition: Vector,
      isHovered?: boolean
    }): void {
      const texture = renderer.getTextureById(this.textureId);
      if (params.layer === RendererLayer.Background && texture != null) {
        renderer.paintTexture(params.ctx, {
          worldPosition: params.worldPosition,
          texture: texture
        });
      }

      if (params.layer !== RendererLayer.Tiles) {
        super.render(renderer, params);
      }
    }
}