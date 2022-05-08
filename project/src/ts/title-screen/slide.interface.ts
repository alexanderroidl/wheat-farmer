import Graphics from "@base/graphics";
import Vector from "@core/vector";

export default interface ISlide {
    render: (graphics: Graphics, ctx: CanvasRenderingContext2D) => void;
    update: (delta: number) => void;
    onClick: (pos: Vector) => void;
}