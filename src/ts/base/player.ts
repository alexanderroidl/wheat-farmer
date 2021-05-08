import Inventory from "./inventory";

export default class Player {
    public readonly items: Inventory = new Inventory();

    constructor () {
        this.items.wheatSeeds = 50;
    }
}