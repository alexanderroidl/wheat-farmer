import World from "./world";
import Camera from "./camera";
import Renderer from "../core/renderer";
import Vector from "../core/vector";

export default class Browser {
    private _statsDisplay: HTMLDivElement = document.createElement('div');

    private _mouseDown: boolean = false;
    private _mousePos: Vector = new Vector(0, 0);

    private _oldWindowWidth: number = window.innerWidth;
    private _oldWindowHeight: number = window.innerHeight;

    get mouseDown (): boolean {
        return this._mouseDown;
    }

    get mousePos (): Vector {
        return this._mousePos;
    }

    /* eslint-disable @typescript-eslint/no-empty-function */
    public onScroll = (delta: number): void => {};
    public onMouseDown = (pos: Vector): void => {};
    public onMouseUp = (pos: Vector): void => {};
    public onMouseMove = (pos: Vector): void => {};
    public onMouseDrag = (pos: Vector): void => {};
    public onMouseClick = (pos: Vector): void => {};
    public onResize = (width: number, height: number, oldWidth: number, oldHeight: number): void => {};
    /* eslint-enable @typescript-eslint/no-empty-function */

    constructor () {
        this.setupDOM();
        this.setupEvents();
    }

    private setupDOM (): void {
        // Stats display
        this._statsDisplay.classList.add('gui');
        this._statsDisplay.classList.add('stats-display');

        // Add everything to DOM
        document.body.append(this._statsDisplay);
    }

    private setupEvents (): void {
        // The flag that determines whether the wheel event is supported
        let supportsWheel = false;

        /* eslint-disable @typescript-eslint/no-explicit-any */
        // The function that will run when the events are triggered
        const wheelHandler = (e: any) => {
            if (e.type == 'wheel') supportsWheel = true;
            else if (supportsWheel) return;

            const delta = ((e.deltaY || -e.wheelDelta || e.detail) >> 10) || 1;
            this.onScroll(delta);
        }
        /* eslint-enable @typescript-eslint/no-explicit-any */

        // Add the event listeners for each event.
        document.addEventListener('wheel', wheelHandler);
        document.addEventListener('mousewheel', wheelHandler);
        document.addEventListener('DOMMouseScroll', wheelHandler);
        document.addEventListener('mousedown', (e) => {
            this._mouseDown = true;
            this.onMouseDown(new Vector(e.screenX, e.screenY));
        });

        document.addEventListener('mouseup', (e) => {
            this._mouseDown = false;
            document.body.style.cursor = '';
            this.onMouseUp(new Vector(e.screenX, e.screenY));
        });

        document.addEventListener('mousemove', (e) => {
            this._mousePos.x = e.clientX;
            this._mousePos.y = e.clientY;

            this.onMouseMove(new Vector(e.clientX, e.clientY));

            if (this._mouseDown) {
                document.body.style.cursor = 'move';
                this.onMouseDrag(new Vector(e.clientX, e.clientY));
            }
        });

        document.addEventListener('click', (e) => {
            this.onMouseClick(this._mousePos);
        });

        window.addEventListener('load', () => {
            this._oldWindowWidth = window.innerWidth;
        });

        window.addEventListener('resize', () => {
            this.onResize(window.innerWidth, window.innerHeight, this._oldWindowWidth, this._oldWindowHeight);

            this._oldWindowWidth = window.innerWidth;
            this._oldWindowHeight = window.innerHeight;
        });
    }

    public getParameter (name: string): string | null {
        // Source: https://stackoverflow.com/a/5448595/11379072

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

    private getWorldStatsHTML (world: World): string {
        return `
            <strong>Time:</strong> ${Math.floor((Date.now() - world.createdAt) / 1000)}s<br>
            <strong>Seeds:</strong>: ${world.player.items.wheatSeeds}<br>
            <strong>Wheat:</strong> ${world.player.items.opium}<br>
            <strong>Money:</strong> ${world.player.items.money} €<br>
        `;
    }

    private getCameraDebugHTML (camera: Camera): string {
        return `
            <strong>Camera:</strong><br>
            <strong>X:</strong> ${camera.position.x.toFixed(3)}<br>
            <strong>Y:</strong> ${camera.position.y.toFixed(3)}<br>
            <strong>Zoom:</strong> ${camera.zoomAmount.toFixed(3)}

        `;
    }

    private getMouseDebugHTML (camera: Camera): string {
        const worldPos = camera.worldPosFromScreen(this._mousePos);

        return `
            <strong>Mouse${(this._mouseDown ? ' (down)' : '')}:</strong><br>
            <strong>X:</strong> ${this._mousePos.x}<br>
            <strong>Y:</strong> ${this._mousePos.y}<br>
            <strong>World X:</strong> ${worldPos.x.toFixed(3)}<br>
            <strong>World Y:</strong> ${worldPos.y.toFixed(3)}
        `;
    }

    private getRendererDebugHTML (renderer: Renderer): string {
        const camera = renderer.camera;

        const xStart = Math.floor(camera.position.x / (renderer.SQUARE_SIZE * camera.zoomAmount));
        const xEnd = Math.ceil((camera.position.x + window.innerWidth) / (renderer.SQUARE_SIZE * camera.zoomAmount));
        const yStart = Math.floor(camera.position.y / (renderer.SQUARE_SIZE * camera.zoomAmount));
        const yEnd = Math.ceil((camera.position.y + window.innerHeight) / (renderer.SQUARE_SIZE * camera.zoomAmount));

        return `
            <strong>Renderer:</strong><br>
            <strong>X-start:</strong> ${xStart}<br> 
            <strong>X-end:</strong> ${xEnd}<br>
            <strong>Y-start:</strong> ${yStart}<br>
            <strong>Y-end:</strong> ${yEnd}
        `
    }

    private getMiscDebugHTML (world: World): string {
        return `
            <strong>Tiles/Min:</strong> ${world.tilesPlantedPerMin}
        `;
    }

    public renderStats (world: World): void {
        this._statsDisplay.innerHTML = `<div class="gui-item">${this.getWorldStatsHTML(world)}</div>`;
    }

    public renderDebug (camera: Camera, renderer: Renderer, world: World): void {
        const debugHTMLParts = [
            this.getWorldStatsHTML(world),
            this.getCameraDebugHTML(camera),
            this.getMouseDebugHTML(camera),
            this.getRendererDebugHTML(renderer),
            this.getMiscDebugHTML(world)
        ];

        this._statsDisplay.innerHTML = (
            '<div class="gui-item">' + 
                debugHTMLParts.join('</div><hr><div class="gui-item">') +
            '</div>'
        );
    }
}