import SlideInterface from "../interfaces/slide-interface";
import Renderer from "../core/renderer";
import Util from "../core/util";
import Vector from "../core/vector";
import Sound from "../base/sound";

export default class TitleScreenLoadSlide implements SlideInterface {
    render (renderer: Renderer, ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = '#111111';
        ctx.fillRect(0, 0, renderer.width, renderer.height);
        
        ctx.fillStyle = '#f3bc3c';
        ctx.textAlign = "center";
        ctx.textBaseline = 'middle';
        ctx.font = `${20 * 1}px "Courier New"`;

        ctx.shadowColor = Util.lightenDarkenColor("#f3bc3c", 20);
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowBlur = 7;
        
        ctx.fillText("Click to load".toUpperCase().split('').join(' '), renderer.width/2, renderer.height/2);

        ctx.shadowBlur = 0;
    }

    update (delta: number): void {
        // TODO: Implement logic
    }

    onClick (pos: Vector): void {
        if (Sound.mainMusic.paused) {
            Sound.mainMusic.volume = 0.75;
            Sound.mainMusic.play();
        }
    }
}