import Renderer from "../core/renderer";

export default interface SlideInterface {
    render: (renderer: Renderer, ctx: CanvasRenderingContext2D) => void;
    update: (delta: number) => void;
}