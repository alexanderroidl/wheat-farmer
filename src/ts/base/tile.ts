export default interface Tile {
    readonly name: string;
    readonly timeCreated: number;

    getChar: () => string;
    getHexColor: () => string;
    onClicked: () => void;
}