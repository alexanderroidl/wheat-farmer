export default interface TileInterface {
    readonly name: string;
    readonly timeCreated: number;

    getChar: () => string;
    getHexColor: () => string;
    getCharColor: () => string;
    onClicked: () => void;
}