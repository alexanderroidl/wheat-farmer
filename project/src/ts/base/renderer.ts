import World from "./world";
import Camera from "./camera";
import { InventoryItem } from "./inventory";
import TextureFactory from "./texture-factory";
import Texture from "./texture";
import Canvas from "../core/canvas";
import Vector from "../core/vector";
import BitMath from "../core/bit-math";
import Browser from "../browser/browser";

export default class Renderer {
  public readonly FONT_SIZE = 12;
  public readonly FONT_EMOJI_SIZE = 16;
  public readonly SQUARE_SIZE = 32;

  private _ctx: CanvasRenderingContext2D | null = null;
  private _textures: Texture[] = [];

  public readonly camera: Camera = new Camera(this.SQUARE_SIZE);
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
  public get ctx (): CanvasRenderingContext2D | null {
    return this._ctx;
  }

  /**
   * Setup canvas for rendering
   */
  constructor (browser: Browser) {
    this._ctx = browser.initializeRendererCanvas();

    const textureFactory = new TextureFactory(64);
    textureFactory.loadTexturesFromFile("sprites.png").then((textures: Texture[]) => {
      this._textures = textures;
    });
  }

  public getTextureById (id: number): Texture | null {
    if (!(this._textures[id] instanceof Texture)) {
      return null;
    }

    return this._textures[id];
  }

  public fillRectWorld (ctx: CanvasRenderingContext2D,
    worldPosition: Vector,
    worldSize: Vector = new Vector(1)): void {
    ctx.fillRect(
      BitMath.ceil(this.z * (this.SQUARE_SIZE * worldPosition.x) - this.camera.position.x),
      BitMath.ceil(this.z * (this.SQUARE_SIZE * worldPosition.y) - this.camera.position.y),
      BitMath.ceil(this.z * (this.SQUARE_SIZE * worldSize.x)),
      BitMath.ceil(this.z * (this.SQUARE_SIZE * worldSize.y))
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
      this.SQUARE_SIZE * totalWorldPos.x * this.z - this.camera.position.x,
      this.SQUARE_SIZE * totalWorldPos.y * this.z - this.camera.position.y
    ).ceil();
    const textureScreenSize = BitMath.ceil(this.SQUARE_SIZE * params.size * this.z);

    // Adjust context for drawing of rotated image
    if (params.rotate != null) {
      ctx.save();
      ctx.translate(drawDelta.x, drawDelta.y);

      drawDelta.x = -textureScreenSize / 2;
      drawDelta.y = -textureScreenSize / 2;

      ctx.rotate(params.rotate);
    }
    
    // Paint texture itself
    const textureToDraw = params.texture.getForScreenWidth(textureScreenSize);
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
      (this.SQUARE_SIZE * worldPosition.x + borderWidth / 2) * this.z - this.camera.position.x,
      (this.SQUARE_SIZE * worldPosition.y + borderWidth / 2) * this.z - this.camera.position.y,
      (this.SQUARE_SIZE - borderWidth) * this.z,
      (this.SQUARE_SIZE - borderWidth) * this.z
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
    while (!canvas.ctx) {
      // Do nothing
    }

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

  /**
   * Render world
   * @param {World} world World object to render
   */
  public render (world: World): void {
    const ctx = this.ctx;

    // Stop here if no Canvas context or textures are loaded yet
    if (!ctx || !this._textures.length) {
      return;
    }

    ctx.imageSmoothingEnabled = false;

    // Clear Canvas entirely
    ctx.clearRect(0, 0, this.width, this.height);

    // Calculate World X and Y start/end to render squares surrounding the world
    const xStart = BitMath.floor(this.camera.position.x / (this.SQUARE_SIZE * this.camera.zoomAmount));
    const xEnd = BitMath.ceil((this.camera.position.x + window.innerWidth) / (this.SQUARE_SIZE * this.camera.zoomAmount));
    const yStart = BitMath.floor(this.camera.position.y / (this.SQUARE_SIZE * this.camera.zoomAmount));
    const yEnd = BitMath.ceil((this.camera.position.y + window.innerHeight) / (this.SQUARE_SIZE * this.camera.zoomAmount));

    // Draw empty squares around world
    for (let y = yStart; y < yEnd; y++) {
      for (let x = xStart; x < xEnd; x++) {
        const emptyPosition = new Vector(x, y);

        this.paintTexture(ctx, {
          worldPosition: emptyPosition,
          texture: this._textures[0]
        });

        ctx.fillStyle = "rgba(0,0,0,0.05)";
        this.fillRectWorld(ctx, emptyPosition);
      }
    }

    // Retrieve current world coordinates from mouse screen coordinates
    const mouseWorldPos = this.camera.worldPosFromScreen(this.mousePos);

    // Iterate through world coordinates
    for (let y = 0; y < world.tiles.length; y++) {
      for (let x = 0; x < world.tiles[y].length; x++) {
        // Is current world square being hovered?
        const isHovered = BitMath.floor(mouseWorldPos.x) === x && BitMath.floor(mouseWorldPos.y) === y;

        // Get tile from current world coordinates
        const tile = world.tiles[y][x];
        const tileWorldPos = new Vector(x, y);

        // Render background tile
        this.paintTexture(ctx, {
          worldPosition: tileWorldPos,
          texture: this._textures[0]
        });

        // Render tile square
        tile.render(this, {
          ctx: ctx,
          worldPosition: tileWorldPos,
          isHovered: isHovered
        });

        // Paint tile outline if hovered
        if (isHovered) {
          this.outlineSquare(ctx, tileWorldPos);
        }
      }
    }

    for (let y = 0; y < world.tiles.length; y++) {
      for (let x = 0; x < world.tiles[y].length; x++) {
        // Is current world square being hovered?
        const isHovered = BitMath.floor(mouseWorldPos.x) === x && BitMath.floor(mouseWorldPos.y) === y;

        // Get tile from current world coordinates
        const tile = world.tiles[y][x];
        const tileWorldPos = new Vector(x, y);
        
        // Invoke last render
        tile.renderLatest(this, {
          ctx: ctx,
          worldPosition: tileWorldPos,
          isHovered: isHovered
        });
      }
    }

    // Draw entities
    for (const entity of world.entities) {
      entity.render(this, ctx);
    }
  }
}