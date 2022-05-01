import { AnimatedSprite, Filter, FrameObject, Texture } from "pixi.js";
import Graphics, { GraphicsLayer } from "../base/graphics";
import Easings from "./easings";
import Vector from "./vector";

export default class MoveableSprite extends AnimatedSprite {
  public static readonly HOVER_OUTLINE_WIDTH = 0.5;
  
  protected dimensions: Vector = new Vector(1, 1);
  public interactive: boolean = true;
  public outlineOnHover: boolean = false;
  public speed: number = 0;
  public moveStartPosition: Vector | null = null;
  public moveStartDistance: number | null = null;
  public sourceFrames: string[] = [];
  public layer: GraphicsLayer = GraphicsLayer.Background;
  private _hovered: boolean = false;
  private _moveTarget: Vector | null = null;

  public get renderOffset (): Vector {
    return new Vector(-this.pivot.x / this.parent.scale.x, -this.pivot.y / this.parent.scale.y);
  }

  public set renderOffset (offset: Vector) {
    this.pivot.set(-offset.x * this.parent.scale.x, -offset.y * this.parent.scale.y);
  }

  public get moveHasCompleted (): boolean {
    return this.moveTarget instanceof Vector && (this.x === this.moveTarget.x && this.y === this.moveTarget.y);
  }

  public get isMoving (): boolean {
    return this.speed > 0 && this.moveTarget instanceof Vector && !this.moveHasCompleted;
  }

  public get movedDistance (): number {
    if (!this.moveStartPosition) {
      return 0;
    }
    return this.moveStartPosition.substract(this.x, this.y).length;
  }

  public set moveTarget (moveTarget: Vector | null) {
    this._moveTarget = moveTarget;

    if (moveTarget instanceof Vector) {
      this.moveStartPosition = new Vector(this.x, this.y);
      this.moveStartDistance = moveTarget.substract(this.x, this.y).length;
    } else {
      this.moveStartPosition = null;
      this.moveStartDistance = null;
    }
  }

  public get moveTarget (): Vector | null {
    return this._moveTarget;
  }

  public get hovered (): boolean {
    return this._hovered;
  }

  public set textures (textures: Texture[] | FrameObject[]) {
    super.textures = Graphics.getTrimmedTexturesForDimensions(textures, this.dimensions);
  }

  public static getFrameObjects (textures: Texture[], time: number): FrameObject[] {
    return textures.map((texture: Texture): FrameObject => {
      return { texture, time };
    });
  }

  constructor (textures: Texture[] | FrameObject[]) {
    super([Texture.EMPTY]);
    
    this.textures = textures;
    this.scale.set(1.0 / Graphics.SQUARE_SIZE);

    this.on("mouseover", () => {
      this._hovered = true;
    });

    this.on("mouseout", () => {
      this._hovered = false;
    });
  }

  protected move (delta: number): Vector {
    // Entity has no assigned target
    if (this.moveTarget == null || this.moveStartDistance == null) {
      return new Vector(0);
    }

    let entitySpeed = this.speed * (delta / 1000);
    let distance = this.moveTarget.substract(this.x, this.y).length;

    const distanceProgress = distance / this.moveStartDistance;

    entitySpeed = entitySpeed * (1 + 2 * Easings.easeInOutQuart(1 - distanceProgress));

    if (distance <= entitySpeed) {
      distance = entitySpeed;
    }

    return this.moveTarget.substract(this.x, this.y).multiply(entitySpeed / distance);
  }

  public updateSprite (deltaTime: number): void {
    if (this.isMoving) {
      const moveDelta = this.move(deltaTime);
      
      this.x += moveDelta.x;
      this.y += moveDelta.y;
    }
  }

  public addFilter (filter: Filter): void {
    this.filters = [...(this.filters ?? []), filter];
  }

  public removeFilter (filter: Filter): void {
    this.filters = this.filters?.filter(filter => filter !== filter) ?? [];
  }

  public toggleFilter (filter: Filter, toggle: boolean): void {
    if (toggle) {
      this.addFilter(filter);
    } else {
      this.removeFilter(filter);
    }
  }
}