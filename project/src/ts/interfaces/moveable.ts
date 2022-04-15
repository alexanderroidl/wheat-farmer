import Vector from "../core/vector";

export default interface IMoveable {
    speed: number;
    moveStartPosition: Vector | null;
    moveStartDistance: number | null;
    moveTarget: Vector | null;
    isMoving: boolean;
    moveHasCompleted: boolean;

    move: (delta: number) => Vector;
}