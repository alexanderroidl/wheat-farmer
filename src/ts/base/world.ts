import EmptyTile from '../tiles/empty';
import PoppyTile from '../tiles/poppy';
import Player from "./player";
import TileInterface from 'interfaces/tile-interface';

export default class World {
    tiles: TileInterface[][];
    createdAt: number = Date.now();;
    player: Player = new Player();

    constructor () {
        this.tiles = Array(20).fill([]).map(() => {
            const emptyTile = new EmptyTile();
            return Array(20).fill(emptyTile);
        });
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