import Renderer from "../core/renderer";
import SlideInterface from "../interfaces/slide-interface";
import TitleScreenLogoSlide from "./title-screen-logo-slide";
import Vector from "../core/vector";

export default class TitleScreen {
    private _hidden: boolean = false;
    private _slideId: number = 0;
    private _slides: SlideInterface[] = [
        new TitleScreenLogoSlide()
    ];
    private _clickedAt: number | null = null;

    get hidden (): boolean {
        return this._hidden;
    }

    public onClick (pos: Vector): void {
        if (this._clickedAt === null) {
            this._clickedAt = Date.now();
        }

        this._hidden = true;
    }

    public update (delta: number): void {
        if (this._slides[this._slideId]) {
            this._slides[this._slideId].update(delta);
        }
    }
    
    public render (renderer: Renderer, ctx: CanvasRenderingContext2D): void {
        if (this._hidden) {
            return;
        }

        if (this._slides[this._slideId]) {
            this._slides[this._slideId].render(renderer, ctx);
        }
    }
}