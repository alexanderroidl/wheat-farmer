import Renderer from "../core/renderer";

export default interface TileInterface {
    readonly name: string;
    readonly timeCreated: number;

    damage: number;

    hasCollision: () => boolean;
    getChar: () => string | null;
    getHexColor: () => string | null;
    getCharColor: () => string | null;
    onClicked: () => void;
    render: (renderer: Renderer, ctx: CanvasRenderingContext2D, worldX: number, worldY: number, isHover: boolean) => void;
    renderLatest: (renderer: Renderer, ctx: CanvasRenderingContext2D, worldX: number, worldY: number, isHover: boolean) => void;
    update: (delta: number) => void;
}