import {
  settings as PIXISettings,
  SCALE_MODES,
  Application,
  Container,
  FrameObject,
  Loader,
  Rectangle,
  Spritesheet,
  Text,
  Texture,
  TilingSprite
} from "pixi.js";
import Tile from "@world/tiles/tile";
import WheatTile from "@world/tiles/wheat-tile";
import { Browser } from "@base/browser/browser";
import MoveableSprite from "@graphics/moveable-sprite";
import Vector from "@core/vector";
import { Camera } from "@base/camera";
import { InventoryItem } from "@world/inventory";
import { ProgressBar } from "./progress-bar";
import { Textures } from "./textures";

export enum GraphicsLayer {
  Background,
  Tiles,
  Entities,
  GUI
}

export default class Graphics extends Application {
  public static readonly FONT_SIZE = 12;
  public static readonly FONT_EMOJI_SIZE = 16;
  public static readonly SQUARE_SIZE = 64;
  public static readonly TEXTURE_SQUARE_SIZE_DIMENSIONS = new Vector(1, 2);
  public static readonly SPRITESHEET_PATH = "spritesheet/sheet.json";

  private static _spriteSheet: Spritesheet | null = null;

  public readonly camera: Camera = new Camera();
  public equippedItem: InventoryItem | null = null;
  public debugText?: Text;
  public backgroundSprite?: TilingSprite;
  private _layers: Container[] = [];
  private _growthProgressBar: ProgressBar = new ProgressBar(0x00FF00);
  private _damageProgressBar: ProgressBar = new ProgressBar(0xFF0000);

  constructor (cb: () => void) {
    super({
      resizeTo: window,
      backgroundColor: 0xFFFFFF,
      resolution: window.devicePixelRatio
    });
    this.setupPIXI();
    this.setupLayers();
    this.setupCameraEvents();
    this.setupLoader(cb);
    this._layers[GraphicsLayer.GUI].addChild(this._growthProgressBar);
    this._layers[GraphicsLayer.GUI].addChild(this._damageProgressBar);
  }

  public get loading (): boolean {
    return Graphics._spriteSheet == null;
  }

  public get screenSize (): Vector {
    return new Vector(this.screen.width, this.screen.height);
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
    return texture;
  }

  public static getTextures (indexes: string[] | number[]): Texture[] {
    return indexes.map((i: string | number) => Graphics.getTexture(i));
  }

  public static getTrimmedTextureForDimensions <T extends Texture | FrameObject> (originalTexture: T, squareSizeDimensions: Vector): T {
    if (!(originalTexture instanceof Texture)) {
      return {
        texture: Graphics.getTrimmedTextureForDimensions(originalTexture.texture, squareSizeDimensions),
        time: originalTexture.time
      } as T;
    }

    const texture = originalTexture.clone();
    const textureCoords = Graphics.TEXTURE_SQUARE_SIZE_DIMENSIONS
      .substract(squareSizeDimensions)
      .multiply(Graphics.SQUARE_SIZE);

    texture.frame = new Rectangle(
      texture.orig.x + textureCoords.x,
      texture.orig.y + textureCoords.y,
      texture.orig.width - textureCoords.x,
      texture.orig.height - textureCoords.y
    );

    return texture as T;
  }

  public static getTrimmedTexturesForDimensions <T extends Texture[] | FrameObject[]> (textures: T, squareSizeDimensions: Vector): T {
    return textures.map(texture => {
      return Graphics.getTrimmedTextureForDimensions(texture, squareSizeDimensions);
    }) as T;
  }

  public addChild (...children: MoveableSprite[]): void {
    for (const child of children) {
      this._layers[child.layer].addChild(child);
    }
  }

  public removeChild (...children: MoveableSprite[]): void {
    for (const child of children) {
      this._layers[child.layer].removeChild(child);
    }
  }

  public getWorldPosFromScreen (screenPos: Vector): Vector {
    return screenPos
      .substract(this.screenSize.divide(2))
      .divide(Graphics.SQUARE_SIZE * this.camera.z)
      .add(this.camera.position);
  }

  public getVisibleBounds (): Rectangle {
    const screenWorldSize = this.screenSize.divide(Graphics.SQUARE_SIZE * this.camera.z);

    return new Rectangle(
      this.camera.x,
      this.camera.y,
      screenWorldSize.x,
      screenWorldSize.y
    );
  }

  public update (delta: number, cameraMoveDelta: Vector, cameraZoomDelta: number): void {
    this.camera.move(cameraMoveDelta);
    this.camera.z += cameraZoomDelta;

    this.stage.scale.set(Graphics.SQUARE_SIZE * this.camera.z / window.devicePixelRatio);
    this.stage.pivot.set(this.camera.x, this.camera.y);
    this.stage.x = this.screen.width / (2 * window.devicePixelRatio);
    this.stage.y = this.screen.height / (2 * window.devicePixelRatio);

    this.updateBackgroundSprite();
    this.updateTileGUI(delta);
  }

  private setupLayers (): void {
    for (let layerIndex = 0; layerIndex < Object.keys(GraphicsLayer).length; layerIndex++) {
      this._layers[layerIndex] = new Container();
      this._layers[layerIndex].zIndex = layerIndex;
      this.stage.addChild(this._layers[layerIndex]);
    }
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
    PIXISettings.SCALE_MODE = SCALE_MODES.NEAREST;
    PIXISettings.RESOLUTION = window.devicePixelRatio;
    PIXISettings.FILTER_RESOLUTION = window.devicePixelRatio;
    this.stage.sortableChildren = true;
    Browser.addPixi(this);
  }

  private createBackgroundSprite (): TilingSprite {
    const bgTexture = Textures.background.clone();
    bgTexture.frame = new Rectangle(bgTexture.orig.x, bgTexture.orig.height / 2, bgTexture.orig.width, bgTexture.orig.height / 2);

    const backgroundSprite = new TilingSprite(bgTexture);
    backgroundSprite.tileScale.set(1.0 / Graphics.SQUARE_SIZE);
    backgroundSprite.anchor.set(0, 0);

    return backgroundSprite;
  }

  private updateBackgroundSprite (): void {
    if (!this.backgroundSprite) {
      return;
    }

    const screenLeft = this.camera.x - this.screen.width / 2 / Graphics.SQUARE_SIZE / this.camera.z;
    const screenTop = this.camera.y - this.screen.height / 2 / Graphics.SQUARE_SIZE / this.camera.z;

    this.backgroundSprite.width = this.screen.width / Graphics.SQUARE_SIZE / this.camera.z + 1;
    this.backgroundSprite.height = this.screen.height / Graphics.SQUARE_SIZE / this.camera.z + 1;

    this.backgroundSprite.pivot.set(
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

    this.backgroundSprite = this.createBackgroundSprite();
    this._layers[GraphicsLayer.Background].addChild(this.backgroundSprite);

    this.debugText = this.createDebugText();
    this._layers[GraphicsLayer.GUI].addChild(this.debugText);

    cb.call(null);
  }

  private createDebugText (): Text {
    const debugText = new Text("", {
      fontSize: 10
    });
    debugText.scale.set(1.0 / Graphics.SQUARE_SIZE);
    // debugText.anchor.set(0.5, 0.5);
    debugText.position.set(1, 1);
    return debugText;
  }

  private updateTileGUI (delta: number): void {
    this._growthProgressBar.visible = false;
    this._damageProgressBar.visible = false;

    const tiles = this._layers[GraphicsLayer.Tiles].children as Tile[];
    for (const tile of tiles) {
      if (!tile.hovered) {
        continue;
      }
      this._damageProgressBar.position.set(tile.position.x, tile.position.y + 0.1);
      this._damageProgressBar.progress = tile.damage;
      this._damageProgressBar.visible = this._damageProgressBar.progress > 0;

      if (tile instanceof WheatTile) {
        this._growthProgressBar.position.set(tile.position.x, tile.position.y);
        this._growthProgressBar.progress = (tile as WheatTile).growthRate;
        this._growthProgressBar.visible = this._growthProgressBar.progress < 1;
      }
    }

    this._growthProgressBar.update(delta);
    this._damageProgressBar.update(delta);
  }
}