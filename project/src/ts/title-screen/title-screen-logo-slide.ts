import SlideInterface from "../interfaces/slide-interface";
import Renderer from "../core/renderer";
import Util from "../core/util";
import Vector from "../core/vector";

export default class TitleScreenLogoSlide implements SlideInterface {
    // Generated with "Text To ASCII Art Generator (TAAG)" by patorjk.com
    // https://patorjk.com/software/taag/#p=display&f=Sub-Zero&t=Wheat%20Farmer%0A
    private readonly LOGO: string[] = [
        ' __     __     __  __     ______     ______     ______      ______   ______     ______     __    __     ______     ______    ',
        '/\\ \\  _ \\ \\   /\\ \\_\\ \\   /\\  ___\\   /\\  __ \\   /\\__  _\\    /\\  ___\\ /\\  __ \\   /\\  == \\   /\\ "-./  \\   /\\  ___\\   /\\  == \\   ',
        '\\ \\ \\/ ".\\ \\  \\ \\  __ \\  \\ \\  __\\   \\ \\  __ \\  \\/_/\\ \\/    \\ \\  __\\ \\ \\  __ \\  \\ \\  __<   \\ \\ \\-./\\ \\  \\ \\  __\\   \\ \\  __<   ',
        ' \\ \\__/".~\\_\\  \\ \\_\\ \\_\\  \\ \\_____\\  \\ \\_\\ \\_\\    \\ \\_\\     \\ \\_\\    \\ \\_\\ \\_\\  \\ \\_\\ \\_\\  \\ \\_\\ \\ \\_\\  \\ \\_____\\  \\ \\_\\ \\_\\ ',
        '  \\/_/   \\/_/   \\/_/\\/_/   \\/_____/   \\/_/\\/_/     \\/_/      \\/_/     \\/_/\\/_/   \\/_/ /_/   \\/_/  \\/_/   \\/_____/   \\/_/ /_/ '
    ];

    private readonly DESCRIPTION: string[] = [
        "Plant wheat seeds, harvest crops and sell them.",
        "",
        "Avoid robot attacks at all costs."
    ]

    private readonly CREDITS: string [] = [
        "Programming by Alexander Roidl and Julian Arnold",
        "Music by Julian Arnold"
    ];

    private readonly _longestLineWidth: number;

    constructor () {
        // Determine length of longest logo line
        this._longestLineWidth = this.LOGO.reduce((a: string, b: string) => {
            return a.length > b.length ? a : b;
        }).length;
    }

    render (renderer: Renderer, ctx: CanvasRenderingContext2D): void {
        const targetLogoWidth = 0.75; // 75 % screen width

        // Calculate font size based off target logo screen size
        let fontSize = (renderer.width / (20 * this._longestLineWidth) * 1.65) * targetLogoWidth;
        let lineHeight = 1;

        // Paint black background
        ctx.fillStyle = '#111111';
        ctx.fillRect(0, 0, renderer.width, renderer.height);
        
        // Setup basic text effects
        ctx.fillStyle = '#f3bc3c';
        ctx.textAlign = "center";
        ctx.textBaseline = 'middle';
        ctx.font = `${20 * fontSize}px "Courier New"`;

        // Setup glowing text effect
        ctx.shadowColor = Util.lightenDarkenColor("#f3bc3c", 20);
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowBlur = 7; // TODO: Make responsive
        
        // Compute random y-axis shift value
        // (This leads to the "floating" effect of the logo text)
        const yShift = Math.sin(Date.now() / 1000) * 10;

        // Iterate and output logo lines
        for (let line = 0; line < this.LOGO.length; line++) {
            const lineOffset = 20 * lineHeight * fontSize * (line - this.LOGO.length);
            ctx.fillText(this.LOGO[line], renderer.width/2, renderer.height/2 + lineOffset + yShift)
        }

        // Set static font size for description text
        // TODO: Make responsive
        fontSize = 20; // TODO: Make responsive
        lineHeight = 1.5;

        ctx.textBaseline = 'top';
        ctx.font = `${fontSize}px "Courier New"`;
        
        // Iterate and output description lines
        for (let dLine = 0; dLine < this.DESCRIPTION.length; dLine++) {
            const descriptionOffset = lineHeight * fontSize * (dLine + 3);
            ctx.fillText(this.DESCRIPTION[dLine], renderer.width/2, renderer.height/2 + descriptionOffset)
        }

        // Set static font size for credits text
        fontSize = 15; // TODO: Make responsive
        lineHeight = 1.5;

        ctx.textBaseline = 'bottom';
        ctx.font = `${fontSize}px "Courier New"`;
        ctx.shadowBlur = 5; // TODO: Make responsive
        
        // Iterate and output credit lines
        for (let cLine = 0; cLine < this.DESCRIPTION.length; cLine++) {
            const descriptionOffset = lineHeight * fontSize * (cLine);
            ctx.fillText(this.DESCRIPTION[cLine], renderer.width/2, renderer.height - (1.5 * 3 * fontSize) + descriptionOffset)
        }

        // Reset shadow
        ctx.shadowBlur = 0;
    }

    update (delta: number): void {
        // TODO: Implement logic
    }

    onClick (pos: Vector): void {
        // TODO: Implement logic
    }
}