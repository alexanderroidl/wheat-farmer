import { ColorMatrixFilter } from "@pixi/filter-color-matrix";
import { AdjustmentFilter } from "pixi-filters";
import * as PIXI from "pixi.js";
import { Loader, Spritesheet, Texture } from "pixi.js";
import Vector from "../core/vector";
import { Camera } from "./camera";
import { InventoryItem } from "./inventory";
import { Textures } from "./textures";

export default class Graphics {
  public static readonly FONT_SIZE = 12;
  public static readonly FONT_EMOJI_SIZE = 16;
  public static readonly SQUARE_SIZE = 64;
  public static readonly SPRITESHEET_PATH = "spritesheet/sheet.json";

  private static _spriteSheet: Spritesheet | null = null;

  public readonly camera: Camera = new Camera();
  public size: Vector = new Vector(0, 0);
  public mousePos: Vector = new Vector(0, 0);
  public equippedItem: InventoryItem | null = null;
  public bgSprite!: PIXI.Sprite;
  public debugText: PIXI.Text;

  public get loading (): boolean {
    return Graphics._spriteSheet == null;
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
    this.debugText = this.createDebugText();

    Loader.shared.add(Graphics.SPRITESHEET_PATH).load(() => {
      this.setupSpritesheet(cb);
    });
  }

  private setupSpritesheet (cb?: () => void): void {
    const sheet = Loader.shared.resources[Graphics.SPRITESHEET_PATH].spritesheet;
    if (!sheet) {
      throw new Error(`File "${Graphics.SPRITESHEET_PATH} is not a valid spritesheet JSON file`);
    }
    
    Graphics._spriteSheet = sheet;

    this.bgSprite = this.createBackgroundSprite();

    this.camera.on("moved", (position: Vector) => {
      if (this.bgSprite) {
        this.bgSprite.position.set(position.x - position.x % Graphics.SQUARE_SIZE, position.y - position.y % Graphics.SQUARE_SIZE);
        this.bgSprite.position.set(0, 0);
      }
      this.debugText.text = `Camera: ${position}`;
    });

    Textures.instance;

    cb?.call(null);
  }
  
  private createBackgroundSprite (): PIXI.Sprite {
    const bgTexture = Graphics.getTexture("bg 0");
    const bg = new PIXI.TilingSprite(bgTexture);
    bg.tileScale.set(1.0 / Graphics.SQUARE_SIZE);
    bg.anchor.set(0.5);
    bg.filters = [new AdjustmentFilter({
      brightness: 0.5
    })];
    bg.filters = [this.darkenFilter()];
    return bg;
  }

  private createDebugText (): PIXI.Text {
    const debugText = new PIXI.Text("", {
      fontSize: 10
    });
    debugText.scale.set(1.0 / Graphics.SQUARE_SIZE);
    debugText.anchor.set(0.5, 0.5);
    return debugText;
  }

  public static getTexture (index: string | number): Texture {
    const spriteSheet = Graphics._spriteSheet;
    if (!spriteSheet) {
      throw new Error("Spritesheet not ready yet");
    }
    if (!spriteSheet.textures[index]) {
      throw Error(`Texture "${index}" could not be found in spritesheet`);
    }
    return spriteSheet.textures[index];
  }

  public static getTextures (indexes: string[] | number[]): Texture[] {
    return indexes.map((i: string | number) => Graphics.getTexture(i));
  }

  public darkenFilter (): ColorMatrixFilter {
    const filter = new PIXI.filters.ColorMatrixFilter();
    filter.matrix = [
      1, 0, 0, 0, 0,
      0, 1, 0, 0, 0,
      0, 0, 1, 0, 0,
      0, 0, 0, 1, 0
    ];
    return filter;
  }
}