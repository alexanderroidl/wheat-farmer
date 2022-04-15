import ITradeable from "../interfaces/tradeable";

export class InventoryItem {
  public amount: number = 0;
  public type: ITradeable;

  constructor (type: ITradeable) {
    this.type = type;
  }
}

export class Inventory {
  public static readonly MONEY_PER_WHEAT: number = 3;

  public wheat: number = 0;
  public money: number = 0;
  public items: InventoryItem[];

  constructor () {
    this.items = [
    ];
  }

  public getItemAmount (name: string): number {
    for (const item of this.items) {
      if (name === item.type.name) {
        return item.amount;
      }
    }

    return 0;
  }

  public setItemAmount (name: string, amount: number): void {
    const item = this.getItem(name);
    if (item === null) {
      return;
    }

    item.amount = amount;
  }

  public increaseItemAmount (name: string): void {
    this.setItemAmount(name, this.getItemAmount(name) + 1);
  }

  public decreaseItemAmount (name: string): void {
    const amountLeft = this.getItemAmount(name) - 1;
    this.setItemAmount(name, amountLeft < 0 ? 0 : amountLeft);
  }

  public getItem (name: string): InventoryItem | null {
    for (const item of this.items) {
      if (name === item.type.name) {
        return item;
      }
    }

    return null;
  }

  public purchaseItem (name: string, amount: number): boolean {
    const item = this.getItem(name);
    if (item === null) {
      return false;
    }

    const totalCost = item.type.buyPrice * amount;
    if (this.money - totalCost < 0) {
      return false;
    }

    this.money -= totalCost;
    item.amount += amount;
    return true;
  }

  public sellWheat (amount: number): boolean {
    if (this.wheat - amount < 0) {
      return false;
    }

    this.wheat -= amount;
    this.money += amount * Inventory.MONEY_PER_WHEAT;

    return true;
  }
}