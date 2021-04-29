import TileInterface from '../interfaces/tile-interface';

export default class PoppyTile implements TileInterface {
    readonly PUPPY_GROWTH_TIME = 10 * 1000;
    readonly PUPPY_MIN_SEED_DROP = 0;
    readonly PUPPY_MAX_SEED_DROP = 3;

    name: string = "Poppy";
    timeCreated: number = Date.now();

    get growthState () {
        const growth = (Date.now() - this.timeCreated) / this.PUPPY_GROWTH_TIME;
        return growth > 1 ? 1 : growth;
    }

    getChar (): string {
        return '@' + (Math.floor(this.growthState * 10));
    }

    getHexColor (): string {
        return '#fc144e';
    }

    onClicked (): void {
    }

    harvest (): number {
        return Math.floor(Math.random() * (this.PUPPY_MAX_SEED_DROP - this.PUPPY_MIN_SEED_DROP + 1)) + this.PUPPY_MIN_SEED_DROP;
    }
}