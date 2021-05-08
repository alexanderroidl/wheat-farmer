import Tile from './tile';
import Renderer from '../core/renderer';

export default class EmptyTile extends Tile {
    public static readonly COLOR = '#ebb434';
    public name: string = "Empty";
    public timeCreated: number = Date.now();
    
    public getChar (): string | null {
        return 'x';
    }

    public getHexColor (): string | null {
        return this.getDamagedHexColor(EmptyTile.COLOR);
    }

    public getCharColor (): string | null {
        return '#333333';
    }

    public onClicked (): void {
        // TODO: Implement logic
    }

    public renderLatest (renderer: Renderer, ctx: CanvasRenderingContext2D, x: number, y: number, isHover: boolean): void {
        super.renderLatest(renderer, ctx, x, y, isHover);
    }
}