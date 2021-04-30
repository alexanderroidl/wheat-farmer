import World from "./world";
import Camera from "./camera";

export default class Browser {
    world: World;

    grid: HTMLTableElement = document.createElement('table');
    statsDisplay: HTMLDivElement = document.createElement('div');
    actionsDisplay: HTMLDivElement = document.createElement('div');

    mouseDown: boolean = false;
    mouseX?: number;
    mouseY?: number;
    oldWindowWidth: number = window.innerWidth;
    oldWindowHeight: number = window.innerHeight;

    onScroll = (delta: number): void => {};
    onMouseDown = (x: number, y: number): void => {};
    onMouseUp = (x: number, y: number): void => {};
    onMouseMove = (x: number, y: number): void => {};
    onMouseDrag = (x: number, y: number): void => {};
    onMouseClick = (x: number, y: number): void => {};
    onResize = (width: number, height: number, oldWidth: number, oldHeight: number): void => {};

    constructor (world: World) {
        this.world = world;
        this.setupDOM();
    }

    setupDOM (): void {
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

        // The flag that determines whether the wheel event is supported
        let supportsWheel = false;

        // The function that will run when the events are triggered
        const wheelHandler = (e: any) => {
            if (e.type == "wheel") supportsWheel = true;
            else if (supportsWheel) return;

            const delta = ((e.deltaY || -e.wheelDelta || e.detail) >> 10) || 1;
            this.onScroll(delta);
        }

        // Add the event listeners for each event.
        document.addEventListener('wheel', wheelHandler);
        document.addEventListener('mousewheel', wheelHandler);
        document.addEventListener('DOMMouseScroll', wheelHandler);
        document.addEventListener('mousedown', (e) => {
            this.mouseDown = true;
            this.onMouseDown(e.screenX, e.screenY);
        });

        document.addEventListener('mouseup', (e) => {
            this.mouseDown = false;
            document.body.style.cursor = '';
            this.onMouseUp(e.screenX, e.screenY);
        });

        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;

            this.onMouseMove(e.clientX, e.clientY);

            if (this.mouseDown) {
                document.body.style.cursor = 'move';
                this.onMouseDrag(e.clientX, e.clientY);
            }
        });

        document.addEventListener('click', (e) => {
            if (this.mouseX != null && this.mouseY != null) {
                this.onMouseClick(this.mouseX, this.mouseY);
            }
        });

        window.addEventListener('load', () => {
            this.oldWindowWidth = window.innerWidth;
        });

        window.addEventListener('resize', () => {
            this.onResize(window.innerWidth, window.innerHeight, this.oldWindowWidth, this.oldWindowHeight);
            this.oldWindowWidth = window.innerWidth;
            this.oldWindowHeight = window.innerHeight;
        });
    }

    getParameter (name: string): string | null {
        let result: string | null = null;
        let tmp = [];

        location.search
            .substr(1)
            .split("&")
            .forEach(item => {
                tmp = item.split('=');

                if (tmp[0] === name) {
                    result = decodeURIComponent(tmp[1]);
                }
            });
            
        return result;
    }

    getStatsHTML (): string {
        return `
            <strong>Time:</strong> ${Math.floor((Date.now() - this.world.createdAt) / 1000)}s<br>
            <strong>Poppy seeds</strong>: ${this.world.player.items.poppySeeds}<br>
            <strong>Opium</strong>: ${this.world.player.items.opium}<br>
            <strong>Money</strong>: ${this.world.player.items.money} €<br>
        `;
    }

    getCameraDebugHTML (camera: Camera): string {
        let deltaXText = 'error';
        let deltaYText = 'error';

        if (this.mouseX != null && this.mouseY != null) {
            let {x, y} = camera.worldPosFromScreen(this.mouseX, this.mouseY);
            deltaXText = x.toFixed(3);
            deltaYText = y.toFixed(3);
        }

        return `
            <strong>Camera:</strong><br>
            <strong>X:</strong> ${camera.x.toFixed(3)}<br>
            <strong>Y:</strong> ${camera.y.toFixed(3)}<br>
            <strong>Zoom:</strong> ${camera.zoomAmount.toFixed(3)}<br>
            <strong>World X:</strong> ${deltaXText}<br>
            <strong>World Y:</strong> ${deltaYText}<br>
        `;
    }

    getMouseDebugHTML (): string {
        return `
            <strong>Mouse${(this.mouseDown ? ' (down)' : '')}:</strong><br>
            <strong>X:</strong> ${this.mouseX}<br>
            <strong>Y:</strong> ${this.mouseY}<br>
        `;
    }

    renderStats (): void {
        this.statsDisplay.innerHTML = `<div class="gui-item">${this.getStatsHTML()}</div>`;
    }

    renderDebug (camera: Camera, includeStats: boolean = true): void {
        const debugHTMLParts = [
            this.getCameraDebugHTML(camera),
            this.getMouseDebugHTML()
        ];

        if (includeStats) {
            debugHTMLParts.unshift(this.getStatsHTML());
        }

        this.statsDisplay.innerHTML = (
            '<div class="gui-item">' + 
                debugHTMLParts.join('</div><hr><div class="gui-item">') +
            '</div>'
        );
    }
}