import Renderer from "../base/renderer";
import Vector from "../core/vector";

export default interface EntityInterface {
    readonly name: string;
    readonly speed: number;

    position: Vector;
    textureId: number | null;
    initialPosition: Vector | null;
    initialDistance: number | null;
    target: Vector | null;
    isHostile: boolean;
    isMoving: boolean;
    hasCompletedMove: boolean;

    move: (delta: number) => Vector;
    update: (delta: number) => void;
    render: (renderer: Renderer, ctx: CanvasRenderingContext2D) => void;
}