import TileInterface from '../interfaces/tile-interface';
import Renderer from '../core/renderer';
import Util from '../core/util';

export default class Tile implements TileInterface {
    public static readonly DAMAGE_HEAL_TIME = 60 * 1000;
    public static readonly COLOR: string = '';

    public name: string = "";
    public timeCreated: number = Date.now();

    private _damage: number = 0;

    get damage (): number {
        return this._damage;
    }

    set damage (amount: number) {
        this._damage = amount > 1 ? 1 : amount < 0 ? 0 : amount;
    }

    public hasCollision (): boolean {
        return false;
    }
    
    public getChar (): string | null {
        return 'x';
    }

    public getDamagedHexColor (color: string): string {
        const lightenDarkenFactor = -(this.damage) * 50;
        return Util.lightenDarkenColor(color, lightenDarkenFactor);
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
        if (isHover && this.damage > 0) {
            renderer.paintProgressBar(ctx, x + 0.25/2, y + 0.15, 0.75, 0.15, this.damage, 'red');
        }
    }

    public update (delta: number): void {
        // TODO: Implement logic
    }
}