import TradeableInterface from "../interfaces/tradeable-interface";
import WallTile from "../tiles/wall-tile";

class InventoryItem {
    public amount: number = 0;
    public type: TradeableInterface;

    constructor (type: TradeableInterface) {
        this.type = type;
    }
}

export default class Inventory {
    public wheatSeeds: number = 0;
    public opium: number = 0;
    public money: number = 0;
    public items: InventoryItem[] = [
        new InventoryItem(new WallTile())
    ]

    public getItemAmount (name: string): number {
        for (const item of this.items) {
            if (name === item.type.name) {
                return item.amount;
            }
        }

        return 0;
    }

    public purchaseItem (name: string, amount: number): boolean {
        for (const item of this.items) {
            if (name === item.type.name) {
                const totalCost = item.type.buyPrice * amount;
                if (this.money - totalCost < 0) {
                    return false;
                }
    
                this.money -= totalCost;
                item.amount += amount;
                return true;
            }
        }

        return false;
    }
}