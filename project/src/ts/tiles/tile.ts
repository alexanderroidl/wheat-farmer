import TileInterface from "interfaces/tile-interface";
import Renderer from "../core/renderer";
import Vector from "../core/vector";
import Texture from "../core/texture";

export default class Tile implements TileInterface {
    public static readonly DAMAGE_HEAL_TIME = 60 * 1000;
    public static readonly COLOR: string = "";

    public name: string = "";
    public timeCreated: number = Date.now();

    private _damage: number = 0;

    public get damage (): number {
      return this._damage;
    }

    public set damage (amount: number) {
      this._damage = amount > 1 ? 1 : amount < 0 ? 0 : amount;
    }

    public get textureId (): number | null {
      return null;
    }

    public hasCollision (): boolean {
      return false;
    }

    public getChar (preview: boolean = false): string | null {
      return null;
    }

    public onClicked (): void {
      // TODO: Implement logic
    }

    public render (renderer: Renderer, params: {
      ctx: CanvasRenderingContext2D,
      worldPosition: Vector,
      isHovered?: boolean,
      opacity?: number | null
    }): void {
      if (this.textureId === null) {
        return;
      }
      
      const texture = renderer.getTextureById(this.textureId);

      if (texture instanceof Texture) {
        renderer.paintTexture(params.ctx, {
          worldPosition: params.worldPosition,
          texture: texture
        });
      }
    }

    public renderLatest (renderer: Renderer, params: {
      ctx: CanvasRenderingContext2D
      worldPosition: Vector,
      isHovered?: boolean
    }): void {
      // Is hovered and has damage
      if (params.isHovered && this.damage > 0) {
        // Calculate world position for progress bar
        const damageProgressWorldPos = new Vector(
          params.worldPosition.x + 0.25 / 2,
          params.worldPosition.y + 0.10
        );

        // Render damage progress bar
        renderer.paintProgressBar(params.ctx, {
          worldPosition: damageProgressWorldPos,
          progress: this.damage,
          color: "red"
        });
      }
    }

    public update (delta: number): void {
      this.damage -= delta / Tile.DAMAGE_HEAL_TIME;
    }
}