import World from "./world";
import Camera from "./camera";
import Renderer from "../core/renderer";
import Vector from "../core/vector";
import BitMath from "../core/bit-math";
import {Inventory, InventoryItem} from "./inventory";
import Tile from "../tiles/tile";
import Util from "../core/util";
import Player from "./player";

export default class Browser {
    private _statsDisplay: HTMLDivElement = document.createElement('div');
    private _worldStats: HTMLDivElement = document.createElement('div');
    private _shop: HTMLDivElement | null = null;
    private _inventory: HTMLDivElement | null = null;

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
    public onKeyDown = (keyCode: number, code: string): void => {};
    public onKeyUp = (keyCode: number, code: string): void => {};
    /* eslint-enable @typescript-eslint/no-empty-function */

    constructor () {
        this.setupDOM();
        this.setupEvents();
    }

    private setupDOM (): void {
        // Stats display
        this._statsDisplay.classList.add('gui');
        this._statsDisplay.classList.add('stats-display');

        // World stats
        this._worldStats.classList.add('world-stats');

        // Keyboard info
        const keyboardInfo = document.createElement('div');
        keyboardInfo.classList.add('keyboard-info');
        keyboardInfo.innerHTML = `
            <div class="keyboard-info-row">
                <span>S</span> Open shop
            </div>

            <div class="keyboard-info-row">
                <span>E</span> Open inventory
            </div>
        `;

        // Add everything to DOM
        document.body.append(this._statsDisplay, this._worldStats, keyboardInfo);
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
            this.onMouseUp(new Vector(e.screenX, e.screenY));
        });

        document.addEventListener('mousemove', (e) => {
            this._mousePos.x = e.clientX;
            this._mousePos.y = e.clientY;

            this.onMouseMove(new Vector(e.clientX, e.clientY));

            if (this._mouseDown) {
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

        document.addEventListener('keydown', (e: KeyboardEvent) => {
            this.onKeyDown(e.keyCode, e.code);
        });

        document.addEventListener('keyup', (e: KeyboardEvent) => {
            this.onKeyUp(e.keyCode, e.code);
        });
    }

    public static isMobile (): boolean {
        const toMatch = [
            /Android/i,
            /webOS/i,
            /iPhone/i,
            /iPad/i,
            /iPod/i,
            /BlackBerry/i,
            /Windows Phone/i
        ];
    
        return toMatch.some((toMatchItem) => {
            return navigator.userAgent.match(toMatchItem);
        });
    }

    public static alert (text: string): void {
        window.alert(text);
    }

    public static getParameter (name: string): string | null {
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

    private getWorldStatsRowHTML (icon: string, text?: string) {
        if (typeof text === 'undefined') {
            text = "";
        }

        const leftColumn = document.createElement('div');
        leftColumn.classList.add('left');
        leftColumn.innerHTML = icon;

        const rightColumn = document.createElement('div');
        rightColumn.classList.add('right');
        rightColumn.innerHTML = text;

        const statsRow = document.createElement('div');
        statsRow.classList.add('row');
        statsRow.append(leftColumn, rightColumn);

        if (text.length === 2 && !Util.isAlphaNumeric(text)) {
            statsRow.classList.add('emoji');
        }

        return statsRow;
    }

    public renderWorldStatsHTML (world: World): void {
        this._worldStats.innerHTML = '';

        let equippedChar = "";
        if (world.player.equipped &&
            world.player.equipped.type instanceof Tile) {
            const char = world.player.equipped.type.getChar(true);

            if (char) {
                equippedChar = char;
            }
        }

        const equippedRow = this.getWorldStatsRowHTML("✋", equippedChar)
        this._worldStats.append(equippedRow);

        const stats = [
            {
                icon: "⌛️",
                text: Math.floor((Date.now() - world.createdAt) / 1000) + 's',
            }, {
                icon: "🌱",
                text: world.player.items.getItemAmount('Wheat'),
            }, {
                icon: "🌾",
                text: world.player.items.wheat,
            }, {
                icon: "💰",
                text: world.player.items.money + ' $',
            }
        ];

        for (const stat of stats) {
            const statsRow = this.getWorldStatsRowHTML(stat.icon, String(stat.text))
            this._worldStats.append(statsRow);
        }
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

        const xStart = BitMath.floor(camera.position.x / (renderer.SQUARE_SIZE * camera.zoomAmount));
        const xEnd = Math.ceil((camera.position.x + window.innerWidth) / (renderer.SQUARE_SIZE * camera.zoomAmount));
        const yStart = BitMath.floor(camera.position.y / (renderer.SQUARE_SIZE * camera.zoomAmount));
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

    public renderDebug (camera: Camera, renderer: Renderer, world: World): void {
        const debugHTMLParts = [
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

    public createDialog (titleText: string, body: HTMLElement, onClose?: () => void): HTMLDivElement {
        body.classList.add('dialog-content');
        
        const close = document.createElement('a');
        close.href = 'javascript:void(0)';
        close.innerHTML = ' - (close)';
        close.addEventListener('click', (e) => {
            if (typeof onClose === 'function') {
                onClose();
            }
            wrap.remove();
        });

        const title = document.createElement('div');
        title.classList.add('dialog-title');
        title.innerHTML = titleText;
        title.append(close);

        const main = document.createElement('div');
        main.classList.add('dialog');
        main.append(title, body);

        const wrap = document.createElement('div');
        wrap.classList.add('dialog-wrap');
        wrap.addEventListener('click', (e) => {
            if (e.target !== wrap) {
                return;
            }

            if (typeof onClose === 'function') {
                onClose();
            }
            wrap.remove();
        });

        wrap.append(main);
        return wrap;
    }

    public sellDialog (value: number, onSuccess: (amount: number) => void): void {
        const amount = window.prompt('How many?', String(value));
        if (amount === null || !BitMath.isInt(amount)) {
            window.alert('Aborted.');
            return;
        }

        onSuccess(parseFloat(amount));
    }

    public onShopSellWheat (inventory: Inventory, cb?: () => void): void {
        this.sellDialog(inventory.wheat, (amount: number) => {
            const sellResult = inventory.sellWheat(amount);

            this.closeShop();
            this.openShop(inventory, cb);

            if (sellResult) {
                alert(`Successfully sold ${amount} wheat for ${amount * Inventory.MONEY_PER_OPIUM} $.`);
            } else {
                alert(`Failed to sell ${amount} wheat.`);
            }
        });
    }

    public onShopItemBuy (inventory: Inventory, item: InventoryItem, cb?: () => void): void {
        const maxBuyAmount = Math.floor(inventory.money / item.type.buyPrice);
        this.sellDialog(maxBuyAmount, (amount: number) => {
            const purchaseResult = inventory.purchaseItem(
                item.type.name, 
                amount
            );

            this.closeShop();
            this.openShop(inventory, cb);

            if (purchaseResult) {
                alert(`Successfully purchased ${amount} ${item.type.name}.`);
            } else {
                alert(`Failed to purchase ${amount} ${item.type.name}.`);
            }
        });
    }

    public openShop (inventory: Inventory, cb?: () => void): void {
        if (this._shop) {
            this.closeShop();
        }

        const dialogBody = document.createElement('div');

        // Sell wheat option
        const sellWheatLink = document.createElement('div');
        sellWheatLink.innerHTML = `- Wheat (+${Inventory.MONEY_PER_OPIUM}$) - ${inventory.wheat} owned`;
        if (inventory.wheat > 0) {
            // On sell wheat click
            sellWheatLink.addEventListener('click', (e) => {
                this.onShopSellWheat(inventory, cb);
            });
        } else {
            sellWheatLink.classList.add('disabled');
        }
        dialogBody.append(sellWheatLink);

        // List inventory item buy options
        for (const inventoryItem of inventory.items) {
            // If neither buy, nor sell price is given, we skip item
            if (inventoryItem.type.buyPrice === 0 && inventoryItem.type.sellPrice === 0) {
                continue;
            }

            const shopInventoryItemLink = document.createElement('div');
            shopInventoryItemLink.innerHTML = `+ ${inventoryItem.type.name} (-${inventoryItem.type.buyPrice}$) - ${inventoryItem.amount} owned`;

            // At least one buyable
            if (inventory.money >= inventoryItem.type.buyPrice) {
                // On item click
                shopInventoryItemLink.addEventListener('click', (e) => {
                    this.onShopItemBuy(inventory, inventoryItem, cb);
                });
            } else {
                shopInventoryItemLink.classList.add('disabled')
            }

            dialogBody.append(shopInventoryItemLink);
        }

        this._shop = this.createDialog('Wheat Farmer Shop', dialogBody, () => {
            if (typeof cb === 'function') {
                cb();
            }
        });
        document.body.append(this._shop);
    }

    public closeShop (): void {
        if (this._shop === null) {
            return;
        }

        this._shop.remove();
        this._shop = null;
    }

    public openInventory (player: Player, inventory: Inventory, cb?: () => void): void {
        if (this._inventory !== null) {
            this._inventory.remove();
        }

        const inventoryBody = document.createElement('div');

        for (const item of inventory.items) {
            const itemRow = document.createElement('div');
            itemRow.innerHTML = item.type.name;

            if (player.equipped && player.equipped.type.name === item.type.name) {
                itemRow.innerHTML += ' (equipped)';
            }

            if (item.amount < 1) {
                itemRow.classList.add('disabled');
            } else {
                itemRow.addEventListener('click', (e) => {
                    player.equipped = item;
                    this.openInventory(player, inventory, cb);
                });
            }

            inventoryBody.append(itemRow);
        }

        this._inventory = this.createDialog('Wheat Farmer Inventory', inventoryBody, () => {
            if (typeof cb === 'function') {
                cb();
            }
        });
        document.body.append(this._inventory);
    }
}