import ISlide from "../interfaces/slide";
import Graphics from "../base/graphics";
import Vector from "../core/vector";
import Sound from "../base/sound"; // TODO: Resolve issue for importing from base URL
import BitMath from "../core/bit-math"; // TODO: Resolve issue for importing from base URL
import Color from "../core/color";

export default class TitleScreenLogoSlide implements ISlide {
  // Generated with "Text To ASCII Art Generator (TAAG)" by patorjk.com
  // https://patorjk.com/software/taag/#p=display&f=Sub-Zero&t=Wheat%20Farmer%0A
  private static readonly LOGO: string[] = [
    " __     __     __  __     ______     ______     ______      ______   ______     ______     __    __     ______     ______    ",
    '/\\ \\  _ \\ \\   /\\ \\_\\ \\   /\\  ___\\   /\\  __ \\   /\\__  _\\    /\\  ___\\ /\\  __ \\   /\\  == \\   /\\ "-./  \\   /\\  ___\\   /\\  == \\   ',
    '\\ \\ \\/ ".\\ \\  \\ \\  __ \\  \\ \\  __\\   \\ \\  __ \\  \\/_/\\ \\/    \\ \\  __\\ \\ \\  __ \\  \\ \\  __<   \\ \\ \\-./\\ \\  \\ \\  __\\   \\ \\  __<   ',
    ' \\ \\__/".~\\_\\  \\ \\_\\ \\_\\  \\ \\_____\\  \\ \\_\\ \\_\\    \\ \\_\\     \\ \\_\\    \\ \\_\\ \\_\\  \\ \\_\\ \\_\\  \\ \\_\\ \\ \\_\\  \\ \\_____\\  \\ \\_\\ \\_\\ ',
    "  \\/_/   \\/_/   \\/_/\\/_/   \\/_____/   \\/_/\\/_/     \\/_/      \\/_/     \\/_/\\/_/   \\/_/ /_/   \\/_/  \\/_/   \\/_____/   \\/_/ /_/ "
  ];
  private static readonly LONGEST_LINE_WIDTH: number = TitleScreenLogoSlide.LOGO.reduce((a: string, b: string) => {
    return a.length > b.length ? a : b;
  }).length;

  private static readonly DESCRIPTION: string[] = [
    "Plant wheat seeds, harvest crops and sell them.",
    "",
    "Avoid robot attacks at all costs."
  ];

  private static readonly CREDITS: string[] = [
    "Programming by ALEXANDER ROIDL and JULIAN ARNOLD",
    "Soundtrack by JULIAN ARNOLD"
  ];

  private static readonly COLOR_BACKGROUND_HEX: string = "#111111";
  private static readonly COLOR_TEXT_HEX: string = "#f3bc3c";
  private static readonly COLOR_TEXT_SHADOW_HEX?: string = Color.fromHex(TitleScreenLogoSlide.COLOR_TEXT_HEX)?.lightenDarken(20)?.toHex();

  public render (graphics: Graphics, ctx: CanvasRenderingContext2D): void {
    const targetLogoWidth = 0.75; // 75 % screen width

    // Calculate font size based off target logo screen size
    let fontSize = (graphics.width / (20 * TitleScreenLogoSlide.LONGEST_LINE_WIDTH) * 1.65) * targetLogoWidth;
    let lineHeight = 1;

    // Paint black background
    ctx.fillStyle = TitleScreenLogoSlide.COLOR_BACKGROUND_HEX;
    ctx.fillRect(0, 0, graphics.width, graphics.height);

    // Setup basic text effects
    ctx.fillStyle = TitleScreenLogoSlide.COLOR_TEXT_HEX;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `${20 * fontSize}px "Courier New"`;

    // Setup glowing text effect
    if (TitleScreenLogoSlide.COLOR_TEXT_SHADOW_HEX) {
      ctx.shadowColor = TitleScreenLogoSlide.COLOR_TEXT_SHADOW_HEX;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.shadowBlur = 7; // TODO: Make responsive
    }

    // Compute random y-axis shift value
    // (This leads to the "floating" effect of the logo text)
    const yShift = Math.sin(Date.now() / 1000) * 10;

    // Iterate and output logo lines
    for (let logoLineIndex = 0; logoLineIndex < TitleScreenLogoSlide.LOGO.length; logoLineIndex++) {
      const logoLineOffset = 20 * lineHeight * fontSize * (logoLineIndex - TitleScreenLogoSlide.LOGO.length);

      const logoTextX = BitMath.floor(graphics.width / 2);
      const logoTextY = BitMath.floor(graphics.height / 2 + logoLineOffset + yShift);

      ctx.fillText(TitleScreenLogoSlide.LOGO[logoLineIndex], logoTextX, logoTextY);
    }

    // Set static font size for description text
    fontSize = 20; // TODO: Make responsive
    lineHeight = 1.5;

    ctx.textBaseline = "top";
    ctx.font = `${fontSize}px "Courier New"`;

    const DESCRIPTION_MARGIN_LINES = 3; // 3 empty lines before description

    // Iterate and output description lines
    for (let descriptionLineIndex = 0; descriptionLineIndex < TitleScreenLogoSlide.DESCRIPTION.length; descriptionLineIndex++) {
      const descriptionLineOffset = lineHeight * fontSize * (descriptionLineIndex + DESCRIPTION_MARGIN_LINES);

      const descriptionTextX = BitMath.floor(graphics.width / 2);
      const descriptionTextY = BitMath.floor(graphics.height / 2 + descriptionLineOffset);

      ctx.fillText(TitleScreenLogoSlide.DESCRIPTION[descriptionLineIndex], descriptionTextX, descriptionTextY);
    }

    // Set static font size for credits text
    fontSize = 15; // TODO: Make responsive
    lineHeight = 1.5;

    ctx.textBaseline = "bottom";
    ctx.font = `${fontSize}px "Courier New"`;
    ctx.shadowBlur = 5; // TODO: Make responsive

    // Iterate and output credit lines
    for (let cLine = 0; cLine < TitleScreenLogoSlide.CREDITS.length; cLine++) {
      const creditsOffset = lineHeight * fontSize * (cLine);
      ctx.fillText(TitleScreenLogoSlide.CREDITS[cLine], graphics.width / 2, graphics.height - (1.5 * 3 * fontSize) + creditsOffset);
    }

    // Reset shadow
    ctx.shadowBlur = 0;
  }

  public update (delta: number): void {
    // Start playing main music immediately
    if (Sound.mainMusic.paused) {
      Sound.mainMusic.volume = 0.6;
      Sound.mainMusic.play();
    }
  }

  public onClick (pos: Vector): void {
    // Decrease volume upon slide change
    Sound.mainMusic.volume = 0.2;
  }
}