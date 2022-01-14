import Renderer from "core/renderer";
import Vector from "core/vector";

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
    char: string;

    move: (delta: number) => Vector;
    update: (delta: number) => void;
    render: (renderer: Renderer, ctx: CanvasRenderingContext2D) => void;
}