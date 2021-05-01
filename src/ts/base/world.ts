import EmptyTile from '../tiles/empty';
import PoppyTile from '../tiles/poppy';
import Player from "./player";
import TileInterface from 'interfaces/tile-interface';

export default class World {
    public readonly SIZE: number = 12; // 20x20 world size

    private _tiles: TileInterface[][];
    private _createdAt: number = Date.now();
    private _player: Player = new Player();

    get tiles () {
        return this._tiles;
    }

    get createdAt () {
        return this._createdAt;
    }

    get player () {
        return this._player;
    }

    constructor () {
        this._tiles = Array(this.SIZE).fill([]).map(() => {
            const emptyTile = new EmptyTile();
            return Array(this.SIZE).fill(emptyTile);
        });
    }

    public isValidTilePos (x: number, y: number): boolean {
        return this._tiles[y] != null && this._tiles[y][x] != null;
    }

    public onTileClicked (x: number, y: number): void {
        if (!this.isValidTilePos(x, y)) {
            return;
        }

        const tile = this._tiles[y][x];
        tile.onClicked();

        if (tile instanceof EmptyTile) {
            if (this._player.items.poppySeeds > 0) {
                this._player.items.poppySeeds--;

                this._tiles[y][x] = new PoppyTile();
            }
        }

        if (tile instanceof PoppyTile) {
            if (tile.growthState >= 1) {
                const seedDrops = tile.harvest();
                
                this._player.items.poppySeeds += seedDrops;
                this._player.items.opium += 1;

                this._tiles[y][x] = new EmptyTile();
            }
        }
    }
}