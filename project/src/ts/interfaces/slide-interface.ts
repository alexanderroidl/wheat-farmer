import Renderer from "../core/renderer";
import Vector from "../core/vector";

export default interface SlideInterface {
    render: (renderer: Renderer, ctx: CanvasRenderingContext2D) => void;
    update: (delta: number) => void;
    onClick: (pos: Vector) => void;
}