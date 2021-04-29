import Tile from '../base/tile';

export default class EmptyTile implements Tile {
    name: string = "Empty";
    timeCreated: number;

    constructor () {
        this.timeCreated = Date.now();
    }
    
    getChar (): string {
        return 'x';
    }

    getHexColor (): string {
        return '#0f8a13';
    }

    onClicked (): void {

    }
}