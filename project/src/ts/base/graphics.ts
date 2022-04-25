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
  Entities,
  GUI
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
  public debugText?: PIXI.Text;
  public background?: PIXI.TilingSprite;
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
    return this.getWorldPosFromScreen(this.mousePos);
  }

  /**
   * Setup canvas for rendering
   */
  constructor (cb: () => void) {
    super({
      resizeTo: window,
      backgroundColor: 0x1099bb,
      resolution: window.devicePixelRatio
    });
    this.setupPIXI();
    this.setupLayers();
    this.setupCameraEvents();
    this.setupLoader(cb);
  }

  private setupLayers (): void {
    this.layers.forEach((layer) => {
      this.stage.addChild(layer);
    });
  }

  private setupCameraEvents (): void {
    this.camera.on("moved", (position: Vector) => {
      if (this.debugText) {
        this.debugText.text = `Camera: ${position}`;
      }

      this.updateBackgroundSprite();
    });

    this.camera.on("zoomed", (zoom: number) => {
      this.updateBackgroundSprite();
    });
  }

  private setupLoader (cb: () => void): void {
    Loader.shared.add(Graphics.SPRITESHEET_PATH).load(() => {
      this.setupSpritesheet(cb);
    });
  }

  private setupPIXI (): void {
    PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
    this.stage.sortableChildren = true;
    Browser.addPixi(this);
  }

  private createBackgroundSprite (): PIXI.TilingSprite {
    const bgTexture = Textures.background.clone();
    bgTexture.frame = new PIXI.Rectangle(bgTexture.orig.x, bgTexture.orig.height / 2, bgTexture.orig.width, bgTexture.orig.height / 2);
    
    const backgroundSprite = new PIXI.TilingSprite(bgTexture);
    backgroundSprite.tileScale.set(1.0 / Graphics.SQUARE_SIZE);

    backgroundSprite.anchor.set(0, 0);
    return backgroundSprite;
  }

  public updateBackgroundSprite (): void {
    if (!this.background) {
      return;
    }

    const screenLeft = this.camera.x - this.screen.width / 2 / Graphics.SQUARE_SIZE / this.camera.z;
    const screenTop = this.camera.y - this.screen.height / 2 / Graphics.SQUARE_SIZE / this.camera.z;

    
    this.background.width = this.screen.width / Graphics.SQUARE_SIZE / this.camera.z + 1;
    this.background.height = this.screen.height / Graphics.SQUARE_SIZE / this.camera.z + 1;


    this.background.pivot.set(
      -(Math.ceil(screenLeft) + screenLeft % (this.camera.z / Graphics.SQUARE_SIZE) - 1),
      -(Math.ceil(screenTop) + screenTop % (this.camera.z / Graphics.SQUARE_SIZE) - 1)
    );
  }

  private setupSpritesheet (cb: () => void): void {
    const sheet = Loader.shared.resources[Graphics.SPRITESHEET_PATH].spritesheet;
    if (!sheet) {
      throw new Error(`File "${Graphics.SPRITESHEET_PATH} is not a valid spritesheet JSON file`);
    }

    Graphics._spriteSheet = sheet;
    Textures.instance;

    this.background = this.createBackgroundSprite();
    this.addChild(this.background);
    this.updateBackgroundSprite();

    this.debugText = this.createDebugText();
    this.stage.addChild(this.debugText);

    cb.call(null);
  }

  private createDebugText (): PIXI.Text {
    const debugText = new PIXI.Text("", {
      fontSize: 10
    });
    debugText.scale.set(1.0 / Graphics.SQUARE_SIZE);
    debugText.anchor.set(0.5, 0.5);
    debugText.parentLayer = this.layers[GraphicsLayer.GUI];
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

  public getWorldPosFromScreen (screenPos: Vector): Vector {
    return new Vector(
      (screenPos.x - this.screen.width / 2) / (Graphics.SQUARE_SIZE * this.camera.z) + this.camera.x,
      (screenPos.y - this.screen.height / 2) / (Graphics.SQUARE_SIZE * this.camera.z) + this.camera.y
    );
  }
}