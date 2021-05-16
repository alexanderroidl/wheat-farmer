import TileInterface from "interfaces/tile-interface";
import Renderer from "core/renderer";
import Util from "../core/util"; // TODO: Resolve issue for importing from base URL
import Vector from "../core/vector"; // TODO: Resolve issue for importing from base URL

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

    public hasCollision (): boolean {
      return false;
    }
    
    public getChar (preview: boolean = false): string | null {
      return "x";
    }

    public getDamagedHexColor (color: string): string {
      const lightenDarkenFactor = -(this.damage) * 50;
      return Util.lightenDarkenColor(color, lightenDarkenFactor);
    }

    public getBackgroundColor (): string | null {
      return null;
    }

    public getTextColor (): string | null {
      return "#000000";
    }

    public onClicked (): void {
      // TODO: Implement logic
    }

    private paintSquare (renderer: Renderer, params: {
      ctx: CanvasRenderingContext2D;
      worldPosition: Vector;
      isHovered?: boolean;
      opacity?: number | null;
    }) {
      const backgroundColor = this.getBackgroundColor();
      if (!backgroundColor) {
        return;
      }

      renderer.paintSquare(params.ctx, {
        worldPosition: params.worldPosition,
        backgroundColor: backgroundColor,
        char: this.getChar(),
        textColor: this.getTextColor(),
        isHovered: params.isHovered
      });
    }

    public render (renderer: Renderer, params: {
      ctx: CanvasRenderingContext2D;
      worldPosition: Vector;
      isHovered?: boolean;
      opacity?: number | null;
    }): void {
      this.paintSquare(renderer, {
        ctx: params.ctx,
        worldPosition: params.worldPosition,
        isHovered: params.isHovered,
        opacity: params.opacity
      });
    }

    public renderLatest (renderer: Renderer, params: {
      ctx: CanvasRenderingContext2D;
      worldPosition: Vector;
      isHovered?: boolean;
    }): void {
      // Is hovered and has damage
      if (params.isHovered && this.damage > 0) {
        // Calculate world position for progress bar
        const damageProgressWorldPos = new Vector(
          params.worldPosition.x + 0.25 / 2,
          params.worldPosition.y + 0.15
        );

        // Calculate world dimensions for progress bar
        const damageProgressWorldSize = new Vector(0.75, 0.15);

        // Render damage progress bar
        renderer.paintProgressBar(params.ctx, {
          worldPosition: damageProgressWorldPos,
          worldSize: damageProgressWorldSize,
          progress: this.damage,
          color: "red"
        });
      }
    }

    public update (delta: number): void {
      this.damage -= delta / Tile.DAMAGE_HEAL_TIME;
    }
}