import Renderer from "../core/renderer";
import SlideInterface from "../interfaces/slide-interface";
import TitleScreenLogoSlide from "./title-screen-logo-slide";
import Vector from "../core/vector";
import TitleScreenLoadSlide from "./title-screen-load";
import Sound from "../base/sound";

export default class TitleScreen {
    private _hidden: boolean = false;
    private _slideId: number = 0;
    private _clickedAt: number | null = null;
    private _slides: SlideInterface[] = [
        new TitleScreenLoadSlide(),
        new TitleScreenLogoSlide()
    ];

    get hidden (): boolean {
        return this._hidden;
    }

    set hidden (hidden: boolean) {
        this._hidden = hidden;
    }

    /**
     * On clicked
     * 
     * @param pos - X/Y screen coordinates
     */
    public onClick (pos: Vector): void {
        if (this._clickedAt === null) {
            this._clickedAt = Date.now();
        }

        // Call onClick for current slide
        this._slides[this._slideId].onClick(pos);

        // No next slide left
        if (this._slideId + 1 > this._slides.length - 1) {
            // Iterate through all slides
            for (const slide of this._slides) {
                // Slide is loading slide
                if (slide instanceof TitleScreenLoadSlide) {
                    // Decrease main music volume for game start
                    Sound.mainMusic.volume = 0.25;
                    break;
                }
            }
            
            // Hide title screen
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