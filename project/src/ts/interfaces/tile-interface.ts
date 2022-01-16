import Renderer from "../base/renderer";
import Vector from "../core/vector";

export interface TileDamageTextureInterface {
  textureIdOffset: number,
  angle: number,
  worldOffset: Vector,
  size: number,
  opacity: number
}

export default interface TileInterface {
    readonly name: string;
    readonly timeCreated: number;

    damage: number;
    damageTextures: TileDamageTextureInterface[];
    textureId: number | null;

    hasCollision: () => boolean;
    getChar: (preview: boolean) => string | null;
    onClicked: () => void;

    render: (renderer: Renderer, params: {
      ctx: CanvasRenderingContext2D;
      worldPosition: Vector;
      isHovered?: boolean;
      opacity?: number | null;
    }) => void;

    renderLatest: (renderer: Renderer, params: {
      ctx: CanvasRenderingContext2D;
      worldPosition: Vector;
      isHovered?: boolean;
    }) => void;

    update: (delta: number) => void;
}