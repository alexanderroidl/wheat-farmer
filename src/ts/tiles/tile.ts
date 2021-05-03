import TileInterface from '../interfaces/tile-interface';
import Renderer from '../core/renderer';

export default class Tile implements TileInterface {
    public static readonly COLOR: string = '';
    public name: string = "";
    public timeCreated: number = Date.now();
    
    public getChar (): string | null {
        return 'x';
    }

    public getHexColor (): string | null {
        return '#000000';
    }

    public getCharColor (): string | null {
        return '#000000';
    }

    public onClicked (): void {
        // TODO: Implement logic
    }

    private paintSquare(renderer: Renderer, ctx: CanvasRenderingContext2D, x: number, y: number, isHover: boolean) {
        const hexColor = this.getHexColor();
        if (!hexColor) {
            return;
        }

        renderer.paintSquare(ctx, x, y, isHover, hexColor, 1, this.getChar(), this.getCharColor());
    }

    public render (renderer: Renderer, ctx: CanvasRenderingContext2D, x: number, y: number, isHover: boolean): void {
        this.paintSquare(renderer, ctx, x, y, isHover);
    }

    public renderLatest (renderer: Renderer, ctx: CanvasRenderingContext2D, x: number, y: number, isHover: boolean): void {
        // TODO: Implement logic
    }
}