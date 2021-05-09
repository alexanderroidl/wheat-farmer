import {Inventory, InventoryItem} from "./inventory";
import WheatTile from "../tiles/wheat-tile";

export default class Player {
    public readonly WHEAT_START_AMOUNT: number = 50;
    public readonly items: Inventory = new Inventory();
    public equipped: InventoryItem | null = null;

    constructor () {
        this.items.setItemAmount("Wheat", this.WHEAT_START_AMOUNT);
        this.equipped = this.items.getItem("Wheat");
    }
}