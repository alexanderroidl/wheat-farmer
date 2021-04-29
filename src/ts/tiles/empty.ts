import TileInterface from '../interfaces/tile-interface';

export default class EmptyTile implements TileInterface {
    name: string = "Empty";
    timeCreated: number = Date.now();
    
    getChar (): string {
        return 'x';
    }

    getHexColor (): string {
        return '#0f8a13';
    }

    onClicked (): void {
    }
}