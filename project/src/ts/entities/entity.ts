import EntityInterface from "interfaces/entity-interface";
import Vector from "../core/vector";
import Easings from "../core/easings";
import Renderer from "../core/renderer";

export default class Entity implements EntityInterface {
  public readonly name: string = "";
  public readonly speed: number = 0;

  private _target: Vector | null = null;

  public position: Vector;
  public initialPosition: Vector | null = null;
  public initialDistance: number | null = null;
  public isHostile: boolean = true;

  constructor (x: number, y: number) {
    this.position = new Vector(x, y);
  }

  public get textureId(): number | null {
    return null;
  }

  public get hasCompletedMove (): boolean {
    return this.target instanceof Vector && (this.position.x === this.target.x && this.position.y === this.target.y);
  }

  public get isMoving (): boolean {
    return this.target instanceof Vector && !this.hasCompletedMove; 
  }

  public set target (target: Vector | null) {
    this._target = target;

    if (target instanceof Vector) {
      this.initialPosition = new Vector(this.position.x, this.position.y);
      this.initialDistance = new Vector(target.x - this.position.x, target.y - this.position.y).length;
    } else {
      this.initialPosition = null;
      this.initialDistance = null;
    }
  }

  public get target (): Vector | null {
    return this._target;
  }

  public get char (): string {
    return "";
  }

  public move (delta: number): Vector {
    if (!this.isMoving) {
      return new Vector(0, 0);
    }

    // Entity has no assigned target
    if (!(this.target instanceof Vector) || typeof this.initialDistance !== "number") {
      return new Vector(0, 0);
    }

    let entitySpeed = this.speed * (delta / 1000);
    let distance = new Vector(this.target.x - this.position.x, this.target.y - this.position.y).length;

    const distanceProgress = distance / this.initialDistance;

    entitySpeed = entitySpeed * (1 + 2 * Easings.easeInOutQuart(1 - distanceProgress));

    if (distance <= entitySpeed) {
      distance = entitySpeed;
    }

    return new Vector(
      entitySpeed * (this.target.x - this.position.x) / distance,
      entitySpeed * (this.target.y - this.position.y) / distance
    );
  }

  public update (delta: number): void {
    if (this.isMoving) {
      const moveDelta = this.move(delta);
      this.position = this.position.add(moveDelta.x, moveDelta.y);
    }
  }

  public render (renderer: Renderer, ctx: CanvasRenderingContext2D): void {
    if (this.textureId === null) {
      return;
    }
    
    const texture = renderer.getTextureById(this.textureId);

    if (texture) {
      renderer.paintTexture(ctx, {
        worldPosition: this.position,
        texture: texture
      });
    }
  }
}