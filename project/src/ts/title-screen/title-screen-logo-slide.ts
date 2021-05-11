import SlideInterface from "../interfaces/slide-interface";
import Renderer from "../core/renderer";
import Util from "../core/util";
import Vector from "../core/vector";

export default class TitleScreenLogoSlide implements SlideInterface {

    private _logo: string[] = [
        ' __     __     __  __     ______     ______     ______      ______   ______     ______     __    __     ______     ______    ',
        '/\\ \\  _ \\ \\   /\\ \\_\\ \\   /\\  ___\\   /\\  __ \\   /\\__  _\\    /\\  ___\\ /\\  __ \\   /\\  == \\   /\\ "-./  \\   /\\  ___\\   /\\  == \\   ',
        '\\ \\ \\/ ".\\ \\  \\ \\  __ \\  \\ \\  __\\   \\ \\  __ \\  \\/_/\\ \\/    \\ \\  __\\ \\ \\  __ \\  \\ \\  __<   \\ \\ \\-./\\ \\  \\ \\  __\\   \\ \\  __<   ',
        ' \\ \\__/".~\\_\\  \\ \\_\\ \\_\\  \\ \\_____\\  \\ \\_\\ \\_\\    \\ \\_\\     \\ \\_\\    \\ \\_\\ \\_\\  \\ \\_\\ \\_\\  \\ \\_\\ \\ \\_\\  \\ \\_____\\  \\ \\_\\ \\_\\ ',
        '  \\/_/   \\/_/   \\/_/\\/_/   \\/_____/   \\/_/\\/_/     \\/_/      \\/_/     \\/_/\\/_/   \\/_/ /_/   \\/_/  \\/_/   \\/_____/   \\/_/ /_/ '
    ];

    private _description: string[] = [
        "Plant wheat seeds, harvest crops and sell them.",
        "",
        "Avoid robot attacks at all costs."
    ]

    private _credits: string [] = [
        "Programming by Alexander Roidl and Julian Arnold",
        "Music by Julian Arnold"
    ];

    render (renderer: Renderer, ctx: CanvasRenderingContext2D): void {
        const longestLineWidth = this._logo.reduce((a: string, b: string) => {
            return a.length > b.length ? a : b;
        }).length;

        const targetLogoWidth = 0.75;
        let fontSize = (renderer.width / (20 * longestLineWidth) * 1.65) * targetLogoWidth;

        ctx.fillStyle = '#111111';
        ctx.fillRect(0, 0, renderer.width, renderer.height);
        
        ctx.fillStyle = '#f3bc3c';
        ctx.textAlign = "center";
        ctx.textBaseline = 'middle';
        ctx.font = `${20 * fontSize}px "Courier New"`;

        ctx.shadowColor = Util.lightenDarkenColor("#f3bc3c", 20);
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowBlur = 7;
        
        const yShift = Math.sin(Date.now() / 1000) * 10;
        for (let line = 0; line < this._logo.length; line++) {
            const lineOffset = 20 * fontSize * (line - this._logo.length);
            ctx.fillText(this._logo[line], renderer.width/2, renderer.height/2 + lineOffset + yShift)
        }

        fontSize = 20;

        ctx.textBaseline = 'top';
        ctx.font = `${fontSize}px "Courier New"`;
        
        for (let dLine = 0; dLine < this._description.length; dLine++) {
            const descriptionOffset = 1.5 * fontSize * (dLine + 3);
            ctx.fillText(this._description[dLine], renderer.width/2, renderer.height/2 + descriptionOffset)
        }

        fontSize = 15;

        ctx.textBaseline = 'bottom';
        ctx.font = `${fontSize}px "Courier New"`;
        ctx.shadowBlur = 5;
        
        for (let cLine = 0; cLine < this._credits.length; cLine++) {
            const descriptionOffset = 1.5 * fontSize * (cLine);
            ctx.fillText(this._credits[cLine], renderer.width/2, renderer.height - (1.5 * 3 * fontSize) + descriptionOffset)
        }

        ctx.shadowBlur = 0;
    }

    update (delta: number): void {
        // TODO: Implement logic
    }

    onClick (pos: Vector): void {
        // TODO: Implement logic
    }
}