import Inventory from "./inventory";

export default class Player {
    items: Inventory = new Inventory();

    constructor () {
        this.items.poppySeeds = 10;
    }
}