import Vector from "core/vector";

export default interface EntityInterface {
    readonly name: string;
    readonly speed: number;

    position: Vector;
    initialPosition: Vector | null;
    initialDistance: number | null;
    target: Vector | null;
    isHostile: boolean;
    isMoving: boolean;
    hasCompletedMove: boolean;
    char: string;

    move: (delta: number) => void;
    update: (delta: number) => void;
}