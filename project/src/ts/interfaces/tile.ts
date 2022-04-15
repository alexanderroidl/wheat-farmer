export default interface ITile {
    readonly name: string;
    readonly age: number;

    damage: number;

    hasCollision: () => boolean;
    getChar: (preview: boolean) => string | null;
}