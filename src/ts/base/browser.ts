import World from "./world";
import Camera from "./camera";

export default class Browser {
    private _statsDisplay: HTMLDivElement = document.createElement('div');

    private _mouseDown: boolean = false;
    private _mouseX?: number;
    private _mouseY?: number;

    private _oldWindowWidth: number = window.innerWidth;
    private _oldWindowHeight: number = window.innerHeight;

    get mouseDown () {
        return this._mouseDown;
    }

    get mouseX () {
        return this._mouseX;
    }

    get mouseY () {
        return this._mouseY;
    }

    public onScroll = (delta: number): void => {};
    public onMouseDown = (x: number, y: number): void => {};
    public onMouseUp = (x: number, y: number): void => {};
    public onMouseMove = (x: number, y: number): void => {};
    public onMouseDrag = (x: number, y: number): void => {};
    public onMouseClick = (x: number, y: number): void => {};
    public onResize = (width: number, height: number, oldWidth: number, oldHeight: number): void => {};

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

        // The function that will run when the events are triggered
        const wheelHandler = (e: any) => {
            if (e.type == 'wheel') supportsWheel = true;
            else if (supportsWheel) return;

            const delta = ((e.deltaY || -e.wheelDelta || e.detail) >> 10) || 1;
            this.onScroll(delta);
        }

        // Add the event listeners for each event.
        document.addEventListener('wheel', wheelHandler);
        document.addEventListener('mousewheel', wheelHandler);
        document.addEventListener('DOMMouseScroll', wheelHandler);
        document.addEventListener('mousedown', (e) => {
            this._mouseDown = true;
            this.onMouseDown(e.screenX, e.screenY);
        });

        document.addEventListener('mouseup', (e) => {
            this._mouseDown = false;
            document.body.style.cursor = '';
            this.onMouseUp(e.screenX, e.screenY);
        });

        document.addEventListener('mousemove', (e) => {
            this._mouseX = e.clientX;
            this._mouseY = e.clientY;

            this.onMouseMove(e.clientX, e.clientY);

            if (this._mouseDown) {
                document.body.style.cursor = 'move';
                this.onMouseDrag(e.clientX, e.clientY);
            }
        });

        document.addEventListener('click', (e) => {
            if (this._mouseX != null && this._mouseY != null) {
                this.onMouseClick(this._mouseX, this._mouseY);
            }
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
            <strong>Poppy seeds</strong>: ${world.player.items.poppySeeds}<br>
            <strong>Opium</strong>: ${world.player.items.opium}<br>
            <strong>Money</strong>: ${world.player.items.money} €<br>
        `;
    }

    private getCameraDebugHTML (camera: Camera): string {
        let deltaXText = 'error';
        let deltaYText = 'error';

        if (this._mouseX != null && this._mouseY != null) {
            let {x, y} = camera.worldPosFromScreen(this._mouseX, this._mouseY);
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

    private getMouseDebugHTML (): string {
        return `
            <strong>Mouse${(this._mouseDown ? ' (down)' : '')}:</strong><br>
            <strong>X:</strong> ${this._mouseX}<br>
            <strong>Y:</strong> ${this._mouseY}<br>
        `;
    }

    public renderStats (world: World): void {
        this._statsDisplay.innerHTML = `<div class="gui-item">${this.getWorldStatsHTML(world)}</div>`;
    }

    public renderDebug (camera: Camera, world?: World): void {
        const debugHTMLParts = [
            this.getCameraDebugHTML(camera),
            this.getMouseDebugHTML()
        ];

        if (world != null) {
            debugHTMLParts.unshift(this.getWorldStatsHTML(world));
        }

        this._statsDisplay.innerHTML = (
            '<div class="gui-item">' + 
                debugHTMLParts.join('</div><hr><div class="gui-item">') +
            '</div>'
        );
    }
}