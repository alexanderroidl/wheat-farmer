import Renderer from "core/renderer";
import SlideInterface from "interfaces/slide-interface";
import Vector from "core/vector";
import TitleScreenLogoSlide from "./title-screen-logo-slide";
import TitleScreenLoadSlide from "./title-screen-load-slide";

export default class TitleScreen {
  public hidden: boolean = false;
  public slideId: number = 0;
  private _clickedAt: number | null = null;
  private _slides: SlideInterface[] = [
    new TitleScreenLoadSlide(),
    new TitleScreenLogoSlide()
  ];

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
    this._slides[this.slideId].onClick(pos);

    // No next slide left
    if (this.slideId + 1 >= this._slides.length) {
      // Hide title screen
      this.hidden = true;
      return;
    }

    this.slideId++;
  }

  public update (delta: number): void {
    if (this._slides[this.slideId]) {
      this._slides[this.slideId].update(delta);
    }
  }

  public render (renderer: Renderer, ctx: CanvasRenderingContext2D): void {
    if (this.hidden) {
      return;
    }

    if (this._slides[this.slideId]) {
      this._slides[this.slideId].render(renderer, ctx);
    }
  }
}