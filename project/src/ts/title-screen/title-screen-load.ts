import SlideInterface from "../interfaces/slide-interface";
import Renderer from "../core/renderer";
import Util from "../core/util";
import Vector from "../core/vector";

export default class TitleScreenLoadSlide implements SlideInterface {
  private readonly TEXT = "Click to load";
  private readonly TRANSFORMED_TEXT: string;

  constructor () {
    const upperCaseText = this.TEXT.toUpperCase();
    this.TRANSFORMED_TEXT = upperCaseText.split("").join(" ");
  }

  public render (renderer: Renderer, ctx: CanvasRenderingContext2D): void {
    // Paint black background
    ctx.fillStyle = "#111111";
    ctx.fillRect(0, 0, renderer.width, renderer.height);

    // Setup basic text effects
    ctx.fillStyle = "#f3bc3c";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `${20}px "Courier New"`; // TODO: Make responsive

    // Setup glowing text effect
    ctx.shadowColor = Util.lightenDarkenColor("#f3bc3c", 20);
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 7; // TODO: Make responsive

    // Fill actual text
    ctx.fillText(this.TRANSFORMED_TEXT, renderer.width / 2, renderer.height / 2);

    // Reset glowing text effect
    ctx.shadowBlur = 0;
  }

  public update (_delta: number): void {
    // TODO: Implement logic
  }

  public onClick (_pos: Vector): void {
    // TODO: Implement logic
  }
}