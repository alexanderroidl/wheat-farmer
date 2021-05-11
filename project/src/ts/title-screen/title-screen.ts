import Renderer from "../core/renderer";
import SlideInterface from "../interfaces/slide-interface";
import TitleScreenLogoSlide from "./title-screen-logo-slide";
import Vector from "../core/vector";
import TitleScreenLoadSlide from "./title-screen-load";

export default class TitleScreen {
    private _hidden: boolean = false;
    private _slideId: number = 0;
    private _slides: SlideInterface[] = [
        new TitleScreenLoadSlide(),
        new TitleScreenLogoSlide()
    ];
    private _clickedAt: number | null = null;

    get hidden (): boolean {
        return this._hidden;
    }

    set hidden (hidden: boolean) {
        this._hidden = hidden;
    }

    public onClick (pos: Vector): void {
        if (this._clickedAt === null) {
            this._clickedAt = Date.now();
        }

        this._slides[this._slideId].onClick(pos);

        if (this._slideId + 1 > this._slides.length - 1) {
            for (const slide of this._slides) {
                if (slide instanceof TitleScreenLoadSlide) {
                    slide.music.volume = 0.25;
                    break;
                }
            }
            this._hidden = true;
            return;
        }
        
        this._slideId++;
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