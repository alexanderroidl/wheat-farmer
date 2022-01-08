import World from "../base/world";
import Camera from "../base/camera";
import EmptyTile from "../tiles/empty-tile";
import Util from "./util";
import Vector from "./vector";
import BitMath from "./bit-math";
import { InventoryItem } from "../base/inventory";
import Browser from "browser/browser";

export default class Renderer {
  public readonly FONT_SIZE = 12;
  public readonly FONT_EMOJI_SIZE = 16;
  public readonly SQUARE_SIZE = 32;
  public readonly COLOR_WORLD_FILL_SQUARES = Util.lightenDarkenColor(EmptyTile.COLOR, 8);

  private _ctx: CanvasRenderingContext2D | null = null;

  public readonly camera: Camera = new Camera(this.SQUARE_SIZE);
  public size: Vector = new Vector(0, 0);
  public mousePos: Vector = new Vector(0, 0);
  public equippedItem: InventoryItem | null = null;

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
  }

  public paintChar (ctx: CanvasRenderingContext2D, params: {
    char: string;
    textColor: string;
    worldPosition: Vector;
    isHovered?: boolean;
  }): void {
    // Apply text shadow if char is currently hovered
    if (params.isHovered) {
      ctx.shadowColor = "white";
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.shadowBlur = BitMath.floor(5 * this.z);
    }

    let fontSize = this.FONT_SIZE;
    let fontFamily = "Courier New";

    // Isn't alphanumeric -> must be emoji
    if (!Util.isAlphaNumeric(params.char)) {
      // Adjust font size and family accordingly
      fontSize = this.FONT_EMOJI_SIZE;
      fontFamily = "OpenMoji";
    }

    // Calculate screen coordinates to draw text at
    const textDrawPos = new Vector(
      (this.SQUARE_SIZE * params.worldPosition.x + this.SQUARE_SIZE / 2) * this.z - this.camera.position.x,
      (this.SQUARE_SIZE * params.worldPosition.y + this.SQUARE_SIZE / 2) * this.z - this.camera.position.y
    );

    // Calculate font size
    const fontDrawSize = BitMath.floor(fontSize * this.z);

    // Paint actual text
    ctx.fillStyle = params.textColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `${fontDrawSize}px "${fontFamily}"`;
    ctx.fillText(params.char, BitMath.floor(textDrawPos.x), BitMath.floor(textDrawPos.y));

    // Reset text shadow
    ctx.shadowBlur = 0;
  }

  public paintSquare (ctx: CanvasRenderingContext2D, params: {
    worldPosition: Vector;
    backgroundColor: string;
    opacity?: number | null;
    char?: string | null;
    textColor?: string | null;
    isHovered?: boolean;
  }): void {
    // Save previous global alpha
    const oldAlpha = ctx.globalAlpha; // TODO: Remove

    // Set global alpha to opacity if given
    if (params.opacity != null) {
      ctx.globalAlpha = params.opacity;
    }

    // Paint square itself
    ctx.fillStyle = params.backgroundColor;
    ctx.fillRect(
      this.SQUARE_SIZE * params.worldPosition.x * this.z - this.camera.position.x,
      this.SQUARE_SIZE * params.worldPosition.y * this.z - this.camera.position.y,
      this.SQUARE_SIZE * this.z,
      this.SQUARE_SIZE * this.z
    );

    // Char for square was given
    if (params.char != null) {
      const charFillStyle = params.textColor || "white";

      // Paint char
      this.paintChar(ctx, {
        char: params.char,
        textColor: charFillStyle,
        worldPosition: params.worldPosition,
        isHovered: params.isHovered
      });
    }

    // Restore previous global alpha
    ctx.globalAlpha = oldAlpha; // TODO: Remove
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
    worldSize?: Vector;
    color?: string | null;
  }): void {
    params.worldSize = params.worldSize || new Vector(0.75, 0.15);
    params.color = params.color || "green";

    // Save previously global alpha
    const oldAlpha = ctx.globalAlpha; // TODO: Remove

    // Set for transparent rendering
    ctx.globalAlpha = 0.65;

    // Render progress bar container
    ctx.fillStyle = "white";
    ctx.fillRect(
      this.SQUARE_SIZE * params.worldPosition.x * this.z - this.camera.position.x,
      this.SQUARE_SIZE * params.worldPosition.y * this.z - this.camera.position.y,
      this.SQUARE_SIZE * params.worldSize.x * this.z,
      this.SQUARE_SIZE * params.worldSize.y * this.z
    );

    // Render progress bar itself
    ctx.fillStyle = params.color;
    ctx.fillRect(
      (this.SQUARE_SIZE * params.worldPosition.x + 1) * this.z - this.camera.position.x,
      (this.SQUARE_SIZE * params.worldPosition.y + 1) * this.z - this.camera.position.y,
      (this.SQUARE_SIZE * params.worldSize.x - 2) * this.z * params.progress,
      (this.SQUARE_SIZE * params.worldSize.y - 2) * this.z
    );

    // Restore previous global alpha
    ctx.globalAlpha = oldAlpha; // TODO: Remove
  }

  /**
   * Render world
   * @param {World} world World object to render
   */
  public render (world: World): void {
    const ctx = this.ctx;

    // Stop here if no Canvas context is given yet
    if (!ctx) {
      return;
    }

    // Retrieve current world coordinates from mouse screen coordinates
    const mouseWorldPos = this.camera.worldPosFromScreen(this.mousePos);

    // Clear Canvas entirely
    ctx.clearRect(0, 0, this.width, this.height);

    // Calculate World X and Y start/end to render squares surrounding the world
    const xStart = Math.floor(this.camera.position.x / (this.SQUARE_SIZE * this.camera.zoomAmount));
    const xEnd = Math.ceil((this.camera.position.x + window.innerWidth) / (this.SQUARE_SIZE * this.camera.zoomAmount));
    const yStart = Math.floor(this.camera.position.y / (this.SQUARE_SIZE * this.camera.zoomAmount));
    const yEnd = Math.ceil((this.camera.position.y + window.innerHeight) / (this.SQUARE_SIZE * this.camera.zoomAmount));

    // Draw empty squares around world
    for (let y = yStart; y < yEnd; y++) {
      for (let x = xStart; x < xEnd; x++) {
        this.paintSquare(ctx, {
          worldPosition: new Vector(x, y),
          backgroundColor: this.COLOR_WORLD_FILL_SQUARES
        });
      }
    }

    // Iterate through world coordinates
    for (let y = 0; y < world.tiles.length; y++) {
      for (let x = 0; x < world.tiles[y].length; x++) {
        // Reset global alpha
        ctx.globalAlpha = 1;

        // Is current world square being hovered?
        const isHovered = BitMath.floor(mouseWorldPos.x) === x && BitMath.floor(mouseWorldPos.y) === y;

        // Get tile from current world coordinates
        const tile = world.tiles[y][x];
        const tileWorldPos = new Vector(x, y);

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
      this.paintChar(ctx, {
        char: entity.char,
        textColor: "white",
        worldPosition: entity.position
      });
    }
  }
}