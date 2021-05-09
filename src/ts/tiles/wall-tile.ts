import Tile from './tile';
import Renderer from '../core/renderer';
import TradeableInterface from '../interfaces/tradeable-interface';

export default class WallTile extends Tile implements TradeableInterface {
    public readonly buyPrice: number = 10;
    public readonly sellPrice: number = 4;

    public name: string = "Wall";

    public hasCollision (): boolean {
        return true;
    }
    
    public getChar (): string | null {
        return null;
    }

    public getHexColor (): string | null {
        return '#111111';
    }

    public getCharColor (): string | null {
        return null;
    }

    public onClicked (): void {
        // TODO: Implement logic
    }

    public renderLatest (renderer: Renderer, ctx: CanvasRenderingContext2D, x: number, y: number, isHover: boolean): void {
        super.renderLatest(renderer, ctx, x, y, isHover);
    }
}