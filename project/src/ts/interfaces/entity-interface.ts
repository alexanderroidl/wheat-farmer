import Vector from "core/vector";

export default interface EntityInterface {
    readonly name: string;
    readonly speed: number;

    position: Vector;
    initialPosition: Vector | null;
    target: Vector | null;
    isHostile: boolean;
    isMoving: boolean;

    getChar: () => string;
}