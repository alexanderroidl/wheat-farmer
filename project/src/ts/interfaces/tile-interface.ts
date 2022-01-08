import Renderer from "core/renderer";
import Vector from "../core/vector";

export default interface TileInterface {
    readonly name: string;
    readonly timeCreated: number;

    damage: number;
    backgroundColor: string | null;
    textColor: string | null;

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