import EmptyTile from '../tiles/empty';
import PoppyTile from '../tiles/poppy';
import Player from "./player";
import TileInterface from 'interfaces/tile-interface';

export default class World {
    readonly SIZE: number = 20; // 20x20 world size

    tiles: TileInterface[][];
    createdAt: number = Date.now();
    player: Player = new Player();

    constructor () {
        this.tiles = Array(this.SIZE).fill([]).map(() => {
            const emptyTile = new EmptyTile();
            return Array(this.SIZE).fill(emptyTile);
        });

        this.tiles[1][1] = new PoppyTile();
    }

    onTileClicked (tile: TileInterface, x: number, y: number) {
        tile.onClicked();

        if (tile instanceof EmptyTile) {
            if (this.player.items.poppySeeds > 0) {
                this.player.items.poppySeeds--;

                this.tiles[y][x] = new PoppyTile();
            }
        }

        if (tile instanceof PoppyTile) {
            if (tile.growthState >= 1) {
                const seedDrops = tile.harvest();
                this.player.items.poppySeeds += seedDrops;
                this.player.items.opium += 1;

                this.tiles[y][x] = new EmptyTile();
            }
        }
    }
}