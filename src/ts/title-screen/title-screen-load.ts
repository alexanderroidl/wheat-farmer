import SlideInterface from "../interfaces/slide-interface";
import Renderer from "../core/renderer";
import Util from "../core/util";
import Vector from "core/vector";

export default class TitleScreenLoadSlide implements SlideInterface {
    music: HTMLAudioElement;

    constructor () {
        this.music = new Audio('audio/210107blunt164.ogg');
        this.music.loop = true;
    }

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
        
        ctx.fillText("Load".toUpperCase().split('').join(' '), renderer.width/2, renderer.height/2);

        ctx.shadowBlur = 0;
    }

    update (delta: number): void {
        // TODO: Implement logic
    }

    onClick (pos: Vector): void {
        if (this.music.paused) {
            this.music.play();
        }
    }
}