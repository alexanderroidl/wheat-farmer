import Vector from "@core/vector";
import { Camera } from "@base/camera";
import Graphics from "@base/graphics";
import { Inventory, InventoryItem } from "@base/inventory";
import Player from "@base/player";
import { World } from "@base/world";
import BitMath from "@core/bit-math";
import Util from "@core/util";
import Tile from "@tiles/tile";
import { Browser, BrowserMouse } from "./browser";

export default class Gui {
  private _mouse: BrowserMouse;

  private _statsDisplay: HTMLDivElement = document.createElement("div");
  private _worldStats: HTMLDivElement = document.createElement("div");
  private _shop: HTMLDivElement | null = null;
  private _inventory: HTMLDivElement | null = null;

  constructor (mouse: BrowserMouse) {
    this._mouse = mouse;

    this.setupDOM();
  }

  public renderWorldStatsHTML (world: World): void {
    this._worldStats.innerHTML = "";

    let equippedChar = "";
    if (world.player.equipped?.type instanceof Tile) {
      const char = world.player.equipped?.type.char;

      if (char) {
        equippedChar = char;
      }
    }

    const equippedRow = this.getWorldStatsRowHTML("✋", equippedChar);
    this._worldStats.append(equippedRow);

    const stats = [
      {
        icon: "🌱",
        text: world.player.items.getItemAmount("Wheat")
      }, {
        icon: "🌾",
        text: world.player.items.wheat
      }, {
        icon: "💰",
        text: world.player.items.money + " $"
      }
    ];

    for (const stat of stats) {
      const statsRow = this.getWorldStatsRowHTML(stat.icon, String(stat.text));
      this._worldStats.append(statsRow);
    }
  }

  public renderDebug (camera: Camera, graphics: Graphics, world: World, fps: number): void {
    const debugHTMLParts = [
      this.getCameraDebugHTML(camera),
      this.getMouseDebugHTML(graphics.getWorldPosFromScreen(this._mouse.position)),
      this.getGraphicsDebugHTML(graphics, fps),
      this.getMiscDebugHTML(world)
    ];

    this._statsDisplay.innerHTML = (
      '<div class="gui-item">' +
      debugHTMLParts.join('</div><hr><div class="gui-item">') +
      "</div>"
    );
  }

  public createDialog (titleText: string, body: HTMLElement, onClose?: () => void): HTMLDivElement {
    body.classList.add("dialog-content");

    const close = document.createElement("a");
    close.href = "javascript:void(0)";
    close.innerHTML = " - (close)";
    close.addEventListener("click", (e) => {
      if (typeof onClose === "function") {
        onClose();
      }
      wrap.remove();
    });

    const title = document.createElement("div");
    title.classList.add("dialog-title");
    title.innerHTML = titleText;
    title.append(close);

    const main = document.createElement("div");
    main.classList.add("dialog");
    main.append(title, body);

    const wrap = document.createElement("div");
    wrap.classList.add("dialog-wrap");
    wrap.addEventListener("click", (e) => {
      if (e.target !== wrap) {
        return;
      }

      if (typeof onClose === "function") {
        onClose();
      }
      wrap.remove();
    });

    wrap.append(main);
    return wrap;
  }

  public sellDialog (value: number, onSuccess: (amount: number) => void): void {
    const amount = window.prompt("How many?", String(value));
    if (amount === null || !BitMath.isInt(amount)) {
      Browser.alert("Aborted.");
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
        alert(`Successfully sold ${amount} wheat for ${amount * Inventory.MONEY_PER_WHEAT} $.`);
      } else {
        alert(`Failed to sell ${amount} wheat.`);
      }
    });
  }

  public onShopItemBuy (inventory: Inventory, item: InventoryItem, cb?: () => void): void {
    const maxBuyAmount = BitMath.floor(inventory.money / item.type.buyPrice);

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

    const dialogBody = document.createElement("div");

    // Sell wheat option
    const sellWheatLink = document.createElement("div");
    sellWheatLink.innerHTML = `- Wheat (+${Inventory.MONEY_PER_WHEAT}$) - ${inventory.wheat} owned`;
    if (inventory.wheat > 0) {
      // On sell wheat click
      sellWheatLink.addEventListener("click", (e) => {
        this.onShopSellWheat(inventory, cb);
      });
    } else {
      sellWheatLink.classList.add("disabled");
    }
    dialogBody.append(sellWheatLink);

    // List inventory item buy options
    for (const inventoryItem of inventory.items) {
      // If neither buy, nor sell price is given, we skip item
      if (inventoryItem.type.buyPrice === 0 && inventoryItem.type.sellPrice === 0) {
        continue;
      }

      const shopInventoryItemLink = document.createElement("div");
      shopInventoryItemLink.innerHTML = `+ ${inventoryItem.type.name} (-${inventoryItem.type.buyPrice}$) - ${inventoryItem.amount} owned`;

      // At least one buyable
      if (inventory.money >= inventoryItem.type.buyPrice) {
        // On item click
        shopInventoryItemLink.addEventListener("click", (e) => {
          this.onShopItemBuy(inventory, inventoryItem, cb);
        });
      } else {
        shopInventoryItemLink.classList.add("disabled");
      }

      dialogBody.append(shopInventoryItemLink);
    }

    this._shop = this.createDialog("Wheat Farmer Shop", dialogBody, () => {
      if (typeof cb === "function") {
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

    const inventoryBody = document.createElement("div");

    for (const item of inventory.items) {
      const itemRow = document.createElement("div");
      itemRow.innerHTML = `${item.type.name} x${item.amount}`;

      if (player.equipped && player.equipped.type.name === item.type.name) {
        itemRow.innerHTML += " (equipped)";
      }

      if (item.amount < 1) {
        itemRow.classList.add("disabled");
      } else {
        itemRow.addEventListener("click", (e) => {
          player.equipped = item;
          this.openInventory(player, inventory, cb);
        });
      }

      inventoryBody.append(itemRow);
    }

    this._inventory = this.createDialog("Wheat Farmer Inventory", inventoryBody, () => {
      if (typeof cb === "function") {
        cb();
      }
    });

    document.body.append(this._inventory);
  }

  private setupDOM (): void {
    // Stats display
    this._statsDisplay.classList.add("gui");
    this._statsDisplay.classList.add("stats-display");

    // World stats
    this._worldStats.classList.add("world-stats");

    // Keyboard info
    const menuInfo = document.createElement("div");
    menuInfo.classList.add("keyboard-info-row");
    menuInfo.innerHTML = "<span>m</span> Menu";
    menuInfo.addEventListener("click", (e) => {
      // TODO: Implement logic
    });

    const shopInfo = document.createElement("div");
    shopInfo.classList.add("keyboard-info-row");
    shopInfo.innerHTML = "<span>S</span> Shop";
    shopInfo.addEventListener("click", (e) => {
      // TODO: Implement logic
    });

    const inventoryInfo = document.createElement("div");
    inventoryInfo.classList.add("keyboard-info-row");
    inventoryInfo.innerHTML = "<span>E</span> Inventory";
    inventoryInfo.addEventListener("click", (e) => {
      // TODO: Implement logic
    });

    const keyboardInfo = document.createElement("div");
    keyboardInfo.classList.add("keyboard-info");
    keyboardInfo.append(menuInfo, shopInfo, inventoryInfo);

    // Add everything to DOM
    document.body.append(this._statsDisplay, this._worldStats, keyboardInfo);
  }

  private getWorldStatsRowHTML (icon: string, text?: string) {
    if (typeof text === "undefined") {
      text = "";
    }

    const leftColumn = document.createElement("div");
    leftColumn.classList.add("left");
    leftColumn.innerHTML = icon;

    const rightColumn = document.createElement("div");
    rightColumn.classList.add("right");
    rightColumn.innerHTML = text;

    const statsRow = document.createElement("div");
    statsRow.classList.add("row");
    statsRow.append(leftColumn, rightColumn);

    if (text.length === 2 && !Util.isAlphaNumeric(text)) {
      statsRow.classList.add("emoji");
    }

    return statsRow;
  }

  private getCameraDebugHTML (camera: Camera): string {
    return `
      <strong>Camera:</strong><br>
      <strong>Position:</strong> ${camera.x.toFixed(3)}, ${camera.y.toFixed(3)}<br>
      <strong>Zoom:</strong> ${camera.z.toFixed(3)}
    `;
  }

  private getMouseDebugHTML (mouseWorldPos: Vector): string {
    return `
      <strong>Mouse${(this._mouse.pressed ? " (down)" : "")}:</strong><br>
      <strong>Screen:</strong> ${this._mouse.position}<br>
      <strong>World:</strong> ${mouseWorldPos}
    `;
  }

  private getGraphicsDebugHTML (graphics: Graphics, fps: number): string {
    const camera = graphics.camera;

    const xStart = BitMath.floor(camera.x / (Graphics.SQUARE_SIZE * camera.z));
    const xEnd = BitMath.ceil((camera.x + window.innerWidth) / (Graphics.SQUARE_SIZE * camera.z));
    const yStart = BitMath.floor(camera.y / (Graphics.SQUARE_SIZE * camera.z));
    const yEnd = BitMath.ceil((camera.y + window.innerHeight) / (Graphics.SQUARE_SIZE * camera.z));

    return `
      <strong>graphics:</strong><br>
      <strong>X:</strong> (${xStart}, ${xEnd})<br> 
      <strong>Y:</strong> (${yStart}, ${yEnd})<br>
      <strong>FPS:</strong> ${fps.toFixed(1)}
    `;
  }

  private getMiscDebugHTML (world: World): string {
    return `
            <strong>Tiles/Min:</strong> ${world.tilesPlantedPerMin}
        `;
  }
}