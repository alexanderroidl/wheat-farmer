import Util from '../core/util';
import EmptyTile from './empty';
import Renderer from '../core/renderer';
import Tile from './tile';
import Easings from '../core/easings';

export default class PoppyTile extends Tile {
    public readonly GROWTH_TIME = 10 * 1000;
    public readonly MIN_SEED_DROP = 0;
    public readonly MAX_SEED_DROP = 3;
    private readonly COLOR_GROWTH_START = '#7dbf21';
    private readonly COLOR_GROWTH_END = '#1e8718';

    public name: string = "Poppy";

    get growthState () {
        const growth = (Date.now() - this.timeCreated) / this.GROWTH_TIME;
        return growth > 1 ? 1 : growth;
    }

    public getChar (): string | null {
        let plantEmoji = '🌿';

        if (this.growthState < 0.4) {
            plantEmoji = '🌱';
        }

        if (this.growthState >= 1) {
            plantEmoji = '🌾';
        }
        return plantEmoji;
    }

    public getCharColor (): string | null {
        return '#ffffff';
    }

    public getHexColor (): string | null { 
        const mixAmount = Easings.easeInCubic(this.growthState);
        return Util.mixColors(EmptyTile.COLOR, this.COLOR_GROWTH_START, mixAmount);
    }

    public onClicked (): void {
    }

    public dropSeeds (): number {
        return Math.floor(Math.random() * (this.MAX_SEED_DROP - this.MIN_SEED_DROP + 1)) + this.MIN_SEED_DROP;
    }

    public render (renderer: Renderer, ctx: CanvasRenderingContext2D, x: number, y: number, isHover: boolean): void {
        super.render(renderer, ctx, x, y, isHover);
    }

    public renderLatest (renderer: Renderer, ctx: CanvasRenderingContext2D, x: number, y: number, isHover: boolean): void {
        super.renderLatest(renderer, ctx, x, y, isHover);

        if (isHover && this.growthState < 1) {
            renderer.paintProgressBar(ctx, x + 0.25/2, y + 0.7, 0.75, 0.2, this.growthState);
        }
    }
}