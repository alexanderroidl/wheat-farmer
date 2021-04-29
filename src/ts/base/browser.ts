import World from "./world";

export default class Browser {
    world: World;

    grid: HTMLTableElement = document.createElement('table');
    statsDisplay: HTMLDivElement = document.createElement('div');
    actionsDisplay: HTMLDivElement = document.createElement('div');

    constructor (world: World) {
        this.world = world;
        this.setupDOM();
    }

    setupDOM (): void {
        // Canvas
        const canvas = document.createElement('canvas');
        document.body.append(canvas);

        // Grid and grid wrapper
        this.grid.classList.add('grid');

        const gridWrapper = document.createElement('div');
        gridWrapper.classList.add('grid-wrapper');
        gridWrapper.append(this.grid);

        // Stats display
        this.statsDisplay.classList.add('gui');
        this.statsDisplay.classList.add('stats-display');

        // Buttons and actions display
        const saveButton = document.createElement('button');
        saveButton.innerHTML = 'Save';
        saveButton.addEventListener('click', () => {
            // Game.save();
        });

        const loadButton = document.createElement('button');
        loadButton.innerHTML = 'Load';
        loadButton.addEventListener('click', () => {
           // Game.load();
        });

        this.actionsDisplay.classList.add('gui');
        this.actionsDisplay.classList.add('actions-display');
        //this.actionsDisplay.append(saveButton, loadButton);

        // Add everything to DOM
        document.body.append(
            gridWrapper, 
            this.statsDisplay, 
            this.actionsDisplay
        );
    }

    renderWorld (): void {
        this.grid.innerHTML = '';

        for (let y = 0; y < this.world.tiles.length; y++) {
            const gridRow: HTMLTableRowElement = document.createElement('tr');

            for (let x = 0; x < this.world.tiles[y].length; x++) {
                const tile = this.world.tiles[y][x];

                const gridCell: HTMLTableCellElement = document.createElement('td');
                gridCell.style.width = `calc(100% / ${this.world.tiles[0].length})`;
                gridCell.style.backgroundColor = tile.getHexColor();

                gridCell.innerHTML = tile.getChar();

                gridCell.addEventListener('click', (e) => {
                    this.world.onTileClicked(tile, x, y);
                    this.render();
                });

                gridRow.append(gridCell);
            }
            this.grid.append(gridRow);
        }
    }

    renderStats (): void {
        this.statsDisplay.innerHTML = `
            <strong>Time:</strong> ${Math.floor((Date.now() - this.world.createdAt) / 1000)}s<br>
            <strong>Poppy seeds</strong>: ${this.world.player.items.poppySeeds}<br>
            <strong>Opium</strong>: ${this.world.player.items.opium}<br>
            <strong>Money</strong>: ${this.world.player.items.money} €<br>
        `;
    }

    render (): void {
        this.renderWorld();
        this.renderStats();
    }

    alert (text: string): void {
        window.alert(text);
    }
}