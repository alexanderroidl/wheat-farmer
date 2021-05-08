import Util from '../core/util';
import EmptyTile from './empty';
import Renderer from '../core/renderer';
import Tile from './tile';
import Easings from '../core/easings';
import BitMath from '../core/bit-math';

export default class WheatTile extends Tile {
    public readonly GROWTH_TIME = 7.5 * 1000;
    public readonly MIN_SEED_DROP = 0;
    public readonly MAX_SEED_DROP = 3;
    private readonly COLOR_GROWN = '#7dbf21';

    public name: string = "Wheat";

    get growthState (): number {
        const growth = (Date.now() - this.timeCreated) / this.GROWTH_TIME;
        if (growth < 1) {
            return growth * (1 - this.damage)
        }
        return growth > 1 ? 1 : growth;
    }

    public getChar (): string | null {
        let char = '🌿';

        if (this.growthState < 0.4) {
            char = '🌱';
        }

        if (this.growthState >= 1) {
            char = '🌾';
        }

        return char;
    }

    public getCharColor (): string | null {
        return '#ffffff';
    }

    public getHexColor (): string | null { 
        const mixAmount = Easings.easeInCubic(this.growthState);
        const growthColor = Util.mixColors(EmptyTile.COLOR, this.COLOR_GROWN, mixAmount);
        return this.getDamagedHexColor(growthColor);
    }

    public onClicked (): void {
        // TODO: Implement logic
    }

    public dropSeeds (): number {
        return BitMath.floor(Math.random() * (this.MAX_SEED_DROP - this.MIN_SEED_DROP + 1)) + this.MIN_SEED_DROP;
    }

    public render (renderer: Renderer, ctx: CanvasRenderingContext2D, x: number, y: number, isHover: boolean): void {
        super.render(renderer, ctx, x, y, isHover);
    }

    public renderLatest (renderer: Renderer, ctx: CanvasRenderingContext2D, x: number, y: number, isHover: boolean): void {
        super.renderLatest(renderer, ctx, x, y, isHover);

        if (isHover && this.growthState < 1) {
            renderer.paintProgressBar(ctx, x + 0.25/2, y + 0.7, 0.75, 0.15, this.growthState);
        }
    }
}