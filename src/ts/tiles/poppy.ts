import Tile from '../base/tile';

export default class PoppyTile implements Tile {
    readonly PUPPY_GROWTH_TIME = 10 * 1000;
    readonly PUPPY_MIN_SEED_DROP = 0;
    readonly PUPPY_MAX_SEED_DROP = 3;

    timeCreated: number;

    name: string = "Poppy";

    get growthState () {
        const growth = (Date.now() - this.timeCreated) / this.PUPPY_GROWTH_TIME;
        return growth > 1 ? 1 : growth;
    }

    constructor () {
        this.timeCreated = Date.now();
    }

    getChar (): string {
        return '@' + (Math.floor(this.growthState * 10));
    }

    getHexColor (): string {
        return '#fc144e';
    }

    onClicked (): void {
        //this.growthState++;
    }

    harvest (): number {
        return Math.floor(Math.random() * (this.PUPPY_MAX_SEED_DROP - this.PUPPY_MIN_SEED_DROP + 1)) + this.PUPPY_MIN_SEED_DROP;
    }
}