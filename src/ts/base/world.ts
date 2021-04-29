import EmptyTile from '../tiles/empty';
import Tile from './tile';
import PoppyTile from '../tiles/poppy';
import Player from "./player";

export default class World {
    tiles: Tile[][];
    createdAt: number;
    player: Player = new Player();

    constructor () {
        const tiles = Array(20).fill([]);

        this.tiles = tiles.map((v) => {
            const emptyTile = new EmptyTile();
            return Array(20).fill(emptyTile);
        });

        this.createdAt = Date.now();
    }

    onTileClicked (tile: Tile, x: number, y: number) {
        tile.onClicked();

        if (tile instanceof EmptyTile) {
            if (this.player.items.poppySeeds > 0) {
                this.tiles[y][x] = new PoppyTile();
                this.player.items.poppySeeds--;
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