import EntityInterface from "interfaces/entity-interface";
import Vector from "../../core/vector";

export default class RobotEntity implements EntityInterface {
    public readonly EXPLODE_TIME = 3 * 1000;

    public readonly name: string = 'Robot';
    public readonly speed: number = 2;

    public position: Vector;
    public initialPosition: Vector | null = null;
    public target: Vector | null = null;
    public isHostile: boolean = true;
    public isMoving: boolean = false;

    private _explodedAt: number | null = null;

    get explosionProgress (): number {
        if (this._explodedAt === null) {
            return 0;
        }
        
        const progress = (Date.now() - this._explodedAt) / this.EXPLODE_TIME;
        return progress > 1 ? 1 : progress;
    }

    get hasExploded (): boolean {
        return this.explosionProgress === 1;
    }

    constructor (x: number, y: number) {
        this.position = new Vector(x, y);
    }

    public getChar (): string {
        if (this.explosionProgress > 0) {
            if (this.explosionProgress <= 0.6) {
                return '💣';
            }

            if (this.explosionProgress > 0.6 && this.explosionProgress < 0.8) {
                return '✨';
            }

            if (this.explosionProgress > 0.8 && this.explosionProgress < 1) {
                return '💥';
            }

            if (this.explosionProgress >= 1) {
                return '🔥';
            }
        }

        return '🤖';
    }

    public explode (): void {
        this._explodedAt = Date.now();
    }
}