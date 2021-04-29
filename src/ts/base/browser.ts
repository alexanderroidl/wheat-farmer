import World from "./world";
import Player from "./player";

export default class Browser {
    grid: HTMLTableElement;
    statsDisplay: HTMLDivElement;

    constructor () {
        const canvas = document.createElement('canvas');
        document.body.append(canvas);

        this.grid = document.createElement('table');
        this.grid.classList.add('grid');

        const gridWrapper = document.createElement('div');
        gridWrapper.classList.add('grid-wrapper');
        gridWrapper.append(this.grid);

        this.statsDisplay = document.createElement('div');
        this.statsDisplay.classList.add('stats-display');

        document.body.append(gridWrapper, this.statsDisplay);
    }

    renderWorld (world: World) {
        this.grid.innerHTML = '';

        for (let y = 0; y < world.tiles.length; y++) {
            const gridRow: HTMLTableRowElement = document.createElement('tr');

            for (let x = 0; x < world.tiles[y].length; x++) {
                const tile = world.tiles[y][x];

                const gridCell: HTMLTableCellElement = document.createElement('td');
                gridCell.style.width = `calc(100% / ${world.tiles[0].length})`;
                gridCell.style.backgroundColor = tile.getHexColor();

                gridCell.innerHTML = tile.getChar();

                gridCell.addEventListener('click', (e) => {
                    world.onTileClicked(tile, x, y);
                    this.renderWorld(world);
                });

                gridRow.append(gridCell);
            }
            this.grid.append(gridRow);
        }
    }

    renderStats (world: World) {
        this.statsDisplay.innerHTML = `
            <strong>Time:</strong> ${Math.floor((Date.now() - world.createdAt) / 1000)}s<br>
            <strong>Poppy seeds:</strong>: ${world.player.items.poppySeeds}<br>
            <strong>Opium:</strong>: ${world.player.items.opium}<br>
            <strong>Money:</strong>: ${world.player.items.money}<br>
        `;
    }

    render (world: World) {
        this.renderWorld(world);
        this.renderStats(world);
    }
}