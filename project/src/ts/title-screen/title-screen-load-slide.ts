import SlideInterface from "interfaces/slide-interface";
import Renderer from "../core/renderer";
import Vector from "../core/vector";
import Color from "../core/color";

export default class TitleScreenLoadSlide implements SlideInterface {
  private static readonly TEXT = "Click to load";
  private static readonly TRANSFORMED_TEXT: string = TitleScreenLoadSlide.TEXT.toUpperCase().split("").join(" ");
  private static readonly COLOR_BACKGROUND_HEX: string = "#111111";
  private static readonly COLOR_TEXT_HEX: string = "#f3bc3c";
  private static readonly COLOR_TEXT_SHADOW_HEX?: string = Color.fromHex(TitleScreenLoadSlide.COLOR_TEXT_HEX)?.lightenDarken(20)?.toHex();

  public render (renderer: Renderer, ctx: CanvasRenderingContext2D): void {
    // Paint black background
    ctx.fillStyle = TitleScreenLoadSlide.COLOR_BACKGROUND_HEX;
    ctx.fillRect(0, 0, renderer.width, renderer.height);

    // Setup basic text effects
    ctx.fillStyle = TitleScreenLoadSlide.COLOR_TEXT_HEX;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `${20}px "Courier New"`; // TODO: Make responsive

    // Setup glowing text effect
    if (TitleScreenLoadSlide.COLOR_TEXT_SHADOW_HEX) {
      ctx.shadowColor = TitleScreenLoadSlide.COLOR_TEXT_SHADOW_HEX;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.shadowBlur = 7; // TODO: Make responsive
    }

    // Fill actual text
    ctx.fillText(TitleScreenLoadSlide.TRANSFORMED_TEXT, renderer.width / 2, renderer.height / 2);

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