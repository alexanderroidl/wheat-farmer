import TileInterface from '../interfaces/tile-interface';

export default class EmptyTile implements TileInterface {
    public name: string = "Empty";
    public timeCreated: number = Date.now();
    
    public getChar (): string {
        return 'x';
    }

    public getHexColor (): string {
        return '#0f8a13';
    }

    public onClicked (): void {
    }
}