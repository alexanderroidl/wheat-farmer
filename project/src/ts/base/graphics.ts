import { Layer } from "@pixi/layers";
import * as PIXI from "pixi.js";
import { DisplayObject, Loader, Point, Spritesheet, Texture } from "pixi.js";
import { Browser } from "../browser/browser";
import Vector from "../core/vector";
import Entity from "../entities/entity";
import Tile from "../tiles/tile";
import { Camera } from "./camera";
import { InventoryItem } from "./inventory";
import { Textures } from "./textures";

export enum GraphicsLayer {
  Background,
  Tiles,
  Entities
}

export default class Graphics extends PIXI.Application {
  public static readonly FONT_SIZE = 12;
  public static readonly FONT_EMOJI_SIZE = 16;
  public static readonly SQUARE_SIZE = 64;
  public static readonly SPRITESHEET_PATH = "spritesheet/sheet.json";

  private static _spriteSheet: Spritesheet | null = null;

  public readonly camera: Camera = new Camera();
  public size: Vector = new Vector(0, 0);
  public mousePos: Vector = new Vector(0, 0);
  public equippedItem: InventoryItem | null = null;
  public debugText!: PIXI.Text;
  public layers: Layer[] = [
    new Layer(),
    new Layer(),
    new Layer()
  ];

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
    super({
      resizeTo: window,
      backgroundColor: 0x1099bb,
      resolution: window.devicePixelRatio
    });
    PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
    this.stage.sortableChildren = true;
    Browser.addPixi(this);

    this.layers.forEach((layer) => {
      this.stage.addChild(layer);
    });

    Loader.shared.add(Graphics.SPRITESHEET_PATH).load(() => {
      this.setupSpritesheet(cb);
    });
  }

  private setupSpritesheet (cb?: () => void): void {
    const sheet = Loader.shared.resources[Graphics.SPRITESHEET_PATH].spritesheet;
    if (!sheet) {
      throw new Error(`File "${Graphics.SPRITESHEET_PATH} is not a valid spritesheet JSON file`);
    }

    this.debugText = this.createDebugText();
    this.stage.addChild(this.debugText);

    this.camera.on("moved", (position: Vector) => {
      this.debugText.text = `Camera: ${position}`;
    });

    Graphics._spriteSheet = sheet;
    Textures.instance;

    cb?.call(null);
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
    const texture = spriteSheet.textures[index].clone();
    texture.defaultAnchor = new Point(0, 0.5);
    return texture;
  }

  public static getTextures (indexes: string[] | number[]): Texture[] {
    return indexes.map((i: string | number) => Graphics.getTexture(i));
  }

  public update (d: number, cameraMoveDelta: Vector, cameraZoomDelta: number): void {
    this.camera.move(cameraMoveDelta);
    this.camera.z += cameraZoomDelta;

    this.stage.scale.set(Graphics.SQUARE_SIZE * this.camera.z / window.devicePixelRatio);
    this.stage.pivot.set(this.camera.x, this.camera.y);
    this.stage.x = this.screen.width / (2 * window.devicePixelRatio);
    this.stage.y = this.screen.height / (2 * window.devicePixelRatio);
  }

  public getObjectLayer (child: DisplayObject): Layer {
    if (child instanceof Tile) {
      return this.layers[GraphicsLayer.Tiles];
    }
    
    if (child instanceof Entity) {
      return this.layers[GraphicsLayer.Entities];
    }
    
    return this.layers[GraphicsLayer.Background];
  }

  public addChild<T extends DisplayObject[]> (...children: T): T[0] {
    for (const child of children) {
      child.parentLayer = this.getObjectLayer(child);
    }
    return this.stage.addChild(...children);
  }

  public removeChild<T extends DisplayObject[]> (...children: T): T[0] {
    for (const child of children) {
      child.parentLayer = undefined;
      this.stage.removeChild(child);
    }
    return this.stage.removeChild(...children);
  }
}