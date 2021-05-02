import Tile from './tile';

export default class EmptyTile extends Tile {
    public static readonly COLOR = '#ebb434';
    public name: string = "Empty";
    public timeCreated: number = Date.now();
    
    public getChar (): string | null {
        return 'x';
    }

    public getHexColor (): string | null {
        return EmptyTile.COLOR;
    }

    public getCharColor (): string | null {
        return '#000000';
    }

    public onClicked (): void {
    }
}