import Tile from './tile';
import Util from '../core/util';

export default class EmptyTile extends Tile {
    public static readonly COLOR = '#ebb434';
    public name: string = "Empty";
    public timeCreated: number = Date.now();
    public tagged: boolean = false;
    
    public getChar (): string | null {
        return 'x';
    }

    public getHexColor (): string | null {
        const lightenDarkenFactor = -(this.damage) * 60;
        return Util.lightenDarkenColor(EmptyTile.COLOR, lightenDarkenFactor);
    }

    public getCharColor (): string | null {
        return '#333333';
    }

    public onClicked (): void {
        // TODO: Implement logic
    }
}