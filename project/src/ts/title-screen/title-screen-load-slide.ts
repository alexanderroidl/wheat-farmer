import SlideInterface from "interfaces/slide-interface";
import Renderer from "core/renderer";
import Util from "../core/util"; // TODO: Resolve issue for importing from base URL
import Vector from "core/vector";

export default class TitleScreenLoadSlide implements SlideInterface {
  private readonly TEXT = "Click to load";
  private readonly TRANSFORMED_TEXT: string;
  private readonly COLOR_BACKGROUND: string = "#111111";
  private readonly COLOR_TEXT: string = "#f3bc3c";
  private readonly COLOR_TEXT_SHADOW: string = Util.lightenDarkenColor(this.COLOR_TEXT, 20);

  constructor () {
    const upperCaseText = this.TEXT.toUpperCase();
    this.TRANSFORMED_TEXT = upperCaseText.split("").join(" ");
  }

  public render (renderer: Renderer, ctx: CanvasRenderingContext2D): void {
    // Paint black background
    ctx.fillStyle = this.COLOR_BACKGROUND;
    ctx.fillRect(0, 0, renderer.width, renderer.height);

    // Setup basic text effects
    ctx.fillStyle = this.COLOR_TEXT;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `${20}px "Courier New"`; // TODO: Make responsive

    // Setup glowing text effect
    ctx.shadowColor = this.COLOR_TEXT_SHADOW;
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