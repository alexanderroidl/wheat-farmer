import { Loader, Spritesheet, Texture } from "pixi.js";
import { Camera } from "./camera";
import { InventoryItem } from "./inventory";
import Vector from "../core/vector";

export default class Graphics {
  public static readonly FONT_SIZE = 12;
  public static readonly FONT_EMOJI_SIZE = 16;
  public static readonly SQUARE_SIZE = 64;
  public static readonly SPRITESHEET_PATH = "spritesheet/sheet.json";

  private _spriteSheet: Spritesheet | null = null;

  public readonly camera: Camera = new Camera();
  public size: Vector = new Vector(0, 0);
  public mousePos: Vector = new Vector(0, 0);
  public equippedItem: InventoryItem | null = null;

  public get loading (): boolean {
    return this._spriteSheet == null;
  }

  /**
   * Canvas width
   */
  public get width (): number {
    return this.size.x;
  }

  /**
   * Canvas height
   */
  public get height (): number {
    return this.size.y;
  }

  public get mouseWorldPos (): Vector {
    return this.camera.worldPosFromScreen(this.mousePos);
  }

  /**
   * Setup canvas for rendering
   */
  constructor (cb?: () => void) {
    Loader.shared.add(Graphics.SPRITESHEET_PATH).load(() => {
      this.setupSpritesheet(cb);
    });
  }

  private setupSpritesheet (cb?: () => void): void {
    const sheet = Loader.shared.resources[Graphics.SPRITESHEET_PATH].spritesheet;
    if (!sheet) {
      throw new Error(`File "${Graphics.SPRITESHEET_PATH} is not a valid spritesheet JSON file`);
    }
    
    this._spriteSheet = sheet;

    if (cb) {
      cb();
    }
  }

  public getTexture (index: string | number): Texture {
    const spriteSheet = this._spriteSheet;
    if (!spriteSheet) {
      throw new Error("Spritesheet not ready yet");
    }
    if (!spriteSheet.textures[index]) {
      throw Error(`Texture "${index}" could not be found in spritesheet`);
    }
    return spriteSheet.textures[index];
  }

  public getTextures (indexes: string[] | number[]): Texture[] {
    return indexes.map((i: string | number) => this.getTexture(i));
  }
}