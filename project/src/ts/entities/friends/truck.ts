import EntityInterface from "interfaces/entity-interface";
import Vector from "../../core/vector";

export default class TruckEntity implements EntityInterface {
    public readonly WAITING_TIME = 3 * 1000;

    public readonly name: string = "Truck";
    public readonly speed: number = 10;

    public position: Vector;
    public initialPosition: Vector | null = null;
    public target: Vector | null = null;
    public isHostile: boolean = false;
    public isMoving: boolean = false;

    private _arrivedAt: number | null = null;

    // Truck waits 3 seconds
    get pickupProgress (): number {
      if (this._arrivedAt === null) {
        return 0;
      }
      const progress = (Date.now() - this._arrivedAt) / this.WAITING_TIME;
      return progress > 1 ? 1 : progress;
    }

    get hasWaited (): boolean {
      return this.pickupProgress === 1;
    }

    constructor (x: number, y: number) {
      this.position = new Vector(x, y);
    }

    public getChar (): string {
      return "🚚";
    }

    public wait (): void {
      this._arrivedAt = Date.now();
    }
}