import TileInterface, { TileDamageTextureInterface } from "../interfaces/tile-interface";
import Vector from "../core/vector";
import Texture from "../base/texture";
import Renderer from "../base/renderer";
import BitMath from "../core/bit-math";
import Easings from "../core/easings";

export default class Tile implements TileInterface {
  public static readonly DAMAGE_HEAL_TIME = 60 * 1000;
  public static readonly COLOR: string = "";

  public name: string = "";
  public timeCreated: number = Date.now();
  public damageTextures: TileDamageTextureInterface[] = [];

  private _damage: number = 0;

  public get damage (): number {
    return this._damage;
  }

  public set damage (damage: number) {
    damage = damage > 1 ? 1 : damage < 0 ? 0 : damage;

    if (damage === 0) {
      this.damageTextures = [];
    }
    if (damage > this._damage) {
      this.createDamageTextures(damage);
    }
    this._damage = damage;
  }

  public get textureId (): number | null {
    return null;
  }

  private createDamageTextures (damage: number): void {
    const damageTextureCount = BitMath.floor(damage * 3) + 1;

    for (let damageTextureNr = 0; damageTextureNr < damageTextureCount; damageTextureNr++) {
      this.damageTextures.push({
        textureIdOffset: BitMath.floor(Math.random() * 3),
        worldOffset: new Vector(Math.random() - 0.5, Math.random() - 0.5),
        angle: Math.random() * Math.PI * 2,
        opacity: Math.random() * 0.65 * damage,
        size: (1 + Easings.easeInCubic(Math.random()) * 2)
      });
    }
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
    if (!(texture instanceof Texture)) {
      return;
    }

    renderer.paintTexture(params.ctx, {
      worldPosition: params.worldPosition,
      texture: texture
    });
  }

  public renderLatest (renderer: Renderer, params: {
    ctx: CanvasRenderingContext2D
    worldPosition: Vector,
    isHovered?: boolean
  }): void {
    // Iterate through damage textures of tile
    for (const damageTexture of this.damageTextures) {
      const texture = renderer.getTextureById(24 + damageTexture.textureIdOffset);
      if (!texture) {
        continue;
      }

      renderer.paintTexture(params.ctx, {
        worldPosition: params.worldPosition.add(damageTexture.worldOffset.x, damageTexture.worldOffset.y),
        texture: texture,
        opacity: damageTexture.opacity * this.damage,
        rotate: damageTexture.angle,
        size: damageTexture.size
      });
    }

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