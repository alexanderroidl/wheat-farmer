import World, { WorldTileInfo } from "./world";
import Camera from "./camera";
import { InventoryItem } from "./inventory";
import TextureFactory from "./texture-factory";
import Texture from "./texture";
import Canvas from "../core/canvas";
import Vector from "../core/vector";
import BitMath from "../core/bit-math";
import Browser from "../browser/browser";
import TitleScreen from "../title-screen/title-screen";
import Easings from "../core/easings";

export enum RendererLayer {
  Background,
  GroundEffects,
  Tiles,
  Entities,
  Air,
  GUI
}

export default class Renderer {
  public static readonly LAYERS_COUNT = Object.keys(RendererLayer).length / 2;
  public static readonly FONT_SIZE = 12;
  public static readonly FONT_EMOJI_SIZE = 16;
  public static readonly SQUARE_SIZE = 32;
  public static readonly TEXTURE_RES = 64;

  private _layers: CanvasRenderingContext2D[] = [];
  private _textures: Texture[] = [];

  public readonly camera: Camera = new Camera(Renderer.SQUARE_SIZE);
  public size: Vector = new Vector(0, 0);
  public mousePos: Vector = new Vector(0, 0);
  public equippedItem: InventoryItem | null = null;

  public get textures (): Texture[] {
    return this._textures;
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

  /**
   * Camera zoom shorthand
   */
  public get z (): number {
    return this.camera.zoomAmount;
  }

  /**
   * Canvas rendering context
   */
  public get layers (): CanvasRenderingContext2D[] {
    return this._layers;
  }

  public get mouseWorldPos (): Vector {
    return this.camera.worldPosFromScreen(this.mousePos);
  }

  /**
   * Setup canvas for rendering
   */
  constructor (browser: Browser) {
    this.setupCanvasLayers(browser);
    this.setupTextures();
  }

  private async setupCanvasLayers (browser: Browser): Promise<void> {
    for (let i = 0; i < Renderer.LAYERS_COUNT; i++) {
      const layerName = Browser.debug ? this.getLayerTypeName(i).toLowerCase() : null;
      this._layers[i] = await browser.initializeRendererCanvas(layerName);
    }
  }

  private async setupTextures (): Promise<void> {
    this._textures = await new TextureFactory(Renderer.TEXTURE_RES).loadTexturesFromFile("sprites.png");
  }

  public getLayerTypeName (layerType: RendererLayer): string {
    const layerKeys = Object.keys(RendererLayer);
    return layerKeys[layerType + layerKeys.length / 2];
  }

  public getTextureById (id: number): Texture | null {
    return this._textures[id] ?? null;
  }

  public fillRectWorld (ctx: CanvasRenderingContext2D,
    worldPosition: Vector,
    worldSize: Vector = new Vector(1)): void {
    ctx.fillRect(
      BitMath.ceil(this.z * (Renderer.SQUARE_SIZE * worldPosition.x) - this.camera.position.x),
      BitMath.ceil(this.z * (Renderer.SQUARE_SIZE * worldPosition.y) - this.camera.position.y),
      BitMath.ceil(this.z * (Renderer.SQUARE_SIZE * worldSize.x)),
      BitMath.ceil(this.z * (Renderer.SQUARE_SIZE * worldSize.y))
    );
  }

  public paintTexture (ctx: CanvasRenderingContext2D, params: {
    worldPosition: Vector,
    texture: Texture,
    opacity?: number | null,
    rotate?: number | null,
    size?: number | null
  }): void {
    // Save previous global alpha
    const oldAlpha = ctx.globalAlpha;

    // Set global alpha to opacity if given
    if (params.opacity != null) {
      ctx.globalAlpha = params.opacity;
    }

    // Prepare size parameter
    params.size = params.size || 1;

    // Calculate values required for texture rendering
    const worldPosDelta = new Vector(params.rotate != null ? 0.5 : 0);
    const totalWorldPos = new Vector(
      params.worldPosition.x + worldPosDelta.x,
      params.worldPosition.y + worldPosDelta.y
    );
    const drawDelta = new Vector(
      Renderer.SQUARE_SIZE * totalWorldPos.x * this.z - this.camera.position.x,
      Renderer.SQUARE_SIZE * totalWorldPos.y * this.z - this.camera.position.y
    ).ceil();
    const textureScreenSize = BitMath.ceil(Renderer.SQUARE_SIZE * params.size * this.z);

    // Adjust context for drawing of rotated image
    if (params.rotate != null) {
      ctx.save();
      ctx.translate(drawDelta.x, drawDelta.y);

      drawDelta.x = -textureScreenSize / 2;
      drawDelta.y = -textureScreenSize / 2;

      ctx.rotate(params.rotate);
    }
    
    // Paint texture itself
    const ratio = textureScreenSize / Renderer.TEXTURE_RES;
    const output = Easings.easeInQuad(ratio);
    const relScreenSize = output * Renderer.TEXTURE_RES;
    const textureToDraw = params.texture.getForScreenWidth(relScreenSize);
    ctx.drawImage(
      textureToDraw.image,
      0,
      0,
      textureToDraw.size.x,
      textureToDraw.size.y,
      drawDelta.x,
      drawDelta.y,
      textureScreenSize,
      textureScreenSize
    );

    // Restore context if rotation was done
    if (params.rotate != null) {
      ctx.restore();
    }

    // Restore previous global alpha
    ctx.globalAlpha = oldAlpha;
  }

  /**
   * Paints an outlined square
   * @param {CanvasRenderingContext2D} ctx Canvas rendering context
   * @param {Vector} worldPosition World coordinates
   * @param {number} [borderWidth=1] Outline border width
   */
  public outlineSquare (ctx: CanvasRenderingContext2D, worldPosition: Vector, borderWidth: number = 1): void {
    ctx.strokeStyle = "white";
    ctx.lineWidth = borderWidth * this.z;
    
    ctx.strokeRect(
      (Renderer.SQUARE_SIZE * worldPosition.x + borderWidth / 2) * this.z - this.camera.position.x,
      (Renderer.SQUARE_SIZE * worldPosition.y + borderWidth / 2) * this.z - this.camera.position.y,
      (Renderer.SQUARE_SIZE - borderWidth) * this.z,
      (Renderer.SQUARE_SIZE - borderWidth) * this.z
    );
  }

  public paintProgressBar (ctx: CanvasRenderingContext2D, params: {
    worldPosition: Vector;
    progress: number;
    color?: string | null;
  }): void {
    const worldSize = new Vector(0.75, 0.10);
    params.color = params.color || "green";

    // Save previously global alpha
    const oldAlpha = ctx.globalAlpha; // TODO: Remove

    // Set for transparent rendering
    ctx.globalAlpha = 0.65;

    // Render progress bar container
    ctx.fillStyle = "white";

    this.fillRectWorld(ctx, params.worldPosition, worldSize);

    // Render progress bar itself
    ctx.fillStyle = params.color;
    const progressBarSize = new Vector(worldSize.x * params.progress, worldSize.y);
    this.fillRectWorld(ctx, params.worldPosition, progressBarSize);

    // Restore previous global alpha
    ctx.globalAlpha = oldAlpha; // TODO: Remove
  }

  public static async generateImageFromData (imageData: ImageData, size: Vector = new Vector(imageData.width, imageData.height)): Promise<HTMLImageElement> {
    const canvas = new Canvas(imageData.width, imageData.height);

    canvas.ctx.imageSmoothingEnabled = false;
    canvas.ctx.putImageData(imageData, 0, 0);
    const img = await canvas.image;

    // Image doesn't need to be resized and is immediately resolved
    if (imageData.width === size.x && imageData.height === size.y) {
      return img;
    }

    // Image requires resizing first
    canvas.width = size.x;
    canvas.height = size.y;
    canvas.ctx?.drawImage(img, 0, 0, imageData.width, imageData.height, 0, 0, size.x, size.y);

    return await canvas.image;
  }

  private async renderLayer (ctx: CanvasRenderingContext2D, layer: RendererLayer, world: World) {
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, this.width, this.height);

    if (layer === RendererLayer.Background) {
      // Calculate World X and Y start/end to render squares surrounding the world
      const xyDivider = Renderer.SQUARE_SIZE * this.camera.zoomAmount;
      const xStart = BitMath.floor(this.camera.position.x / xyDivider);
      const xEnd = BitMath.ceil((this.camera.position.x + window.innerWidth) / xyDivider);
      const yStart = BitMath.floor(this.camera.position.y / xyDivider);
      const yEnd = BitMath.ceil((this.camera.position.y + window.innerHeight) / xyDivider);

      // Draw empty squares around world
      for (let y = yStart; y < yEnd; y++) {
        for (let x = xStart; x < xEnd; x++) {
          const emptyPosition = new Vector(x, y);

          this.paintTexture(ctx, {
            worldPosition: emptyPosition,
            texture: this._textures[0]
          });

          // Darken textures
          ctx.fillStyle = "rgba(0,0,0,0.05)";
          this.fillRectWorld(ctx, emptyPosition);
        }
      }
    }

    if (layer === RendererLayer.Tiles) {
      world.iterateTiles((tileInfo: WorldTileInfo) => {
        // Render tile square
        tileInfo.tile.render(this, {
          ctx: ctx,
          layer: layer,
          worldPosition: tileInfo.worldPos,
          isHovered: tileInfo.isHovered
        });

        // Paint tile outline if hovered
        if (tileInfo.isHovered) {
          this.outlineSquare(ctx, tileInfo.worldPos);
        }
      }, this.mouseWorldPos);
    }

    if (layer === RendererLayer.Entities) {
      // Draw entities
      for (const entity of world.entities) {
        entity.render(this, ctx);
      }
    }

    if (layer === RendererLayer.Background ||
        layer === RendererLayer.GroundEffects ||
        layer === RendererLayer.GUI) {
      world.iterateTiles((tileInfo: WorldTileInfo) => {
        // Invoke last render
        tileInfo.tile.render(this, {
          ctx: ctx,
          layer: layer,
          worldPosition: tileInfo.worldPos,
          isHovered: tileInfo.isHovered
        });
      }, this.mouseWorldPos);
    }
  }

  /**
   * Render world
   * @param {World} world World object to render
   */
  public render (world: World): void {
    if (!this._textures.length) {
      return;
    }

    this.renderLayer(this.layers[RendererLayer.Background], RendererLayer.Background, world);
    this.renderLayer(this.layers[RendererLayer.GroundEffects], RendererLayer.GroundEffects, world);
    this.renderLayer(this.layers[RendererLayer.Tiles], RendererLayer.Tiles, world);
    this.renderLayer(this.layers[RendererLayer.Entities], RendererLayer.Entities, world);
    this.renderLayer(this.layers[RendererLayer.GUI], RendererLayer.GUI, world);
  }

  public renderTitleScreen (titleScreen: TitleScreen): void {
    titleScreen.render(this, this._layers[RendererLayer.GUI]);
  }
}