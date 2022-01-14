import Renderer from "../../core/renderer";
import Vector from "../../core/vector";
import Entity from "../entity";

export default class RobotEntity extends Entity {
  public readonly EXPLODE_TIME = 3 * 1000;
  public readonly MAX_EXPLOSION_RADIUS = 2;
  public readonly MOVEMENT_WAVE_LENGTH = new Vector(1, 1).length * 3;

  public readonly name: string = "Robot";
  public readonly speed: number = 1;
  
  public isHostile: boolean = true;

  private _explodedAt: number | null = null;
  private _sinShift: Vector = new Vector(0, 0);
  private _sinShiftDistanceOffset: number;

  public get explosionProgress (): number {
    if (this._explodedAt === null) {
      return 0;
    }
      
    const progress = (Date.now() - this._explodedAt) / this.EXPLODE_TIME;
    return progress > 1 ? 1 : progress;
  }

  public get hasStartedExploding (): boolean {
    return this._explodedAt !== null;
  }

  public get hasCompletedExplosion (): boolean {
    return this.explosionProgress === 1;
  }

  constructor (x: number, y: number) {
    super(x, y);

    this._sinShiftDistanceOffset = Math.random() * this.MOVEMENT_WAVE_LENGTH;
  }

  public get char (): string {
    if (this.explosionProgress > 0) {
      if (this.explosionProgress <= 0.6) {
        return "💣";
      }

      if (this.explosionProgress > 0.6 && this.explosionProgress < 0.8) {
        return "✨";
      }

      if (this.explosionProgress > 0.8 && this.explosionProgress < 1) {
        return "💥";
      }

      if (this.explosionProgress >= 1) {
        return "🔥";
      }
    }

    return "🤖";
  }

  public explode (): void {
    this._explodedAt = Date.now();
  }

  public update (delta: number): void {
    if (this.isMoving) {
      const moveDelta = this.move(delta);
      const moveDirectionRad = Math.atan2(moveDelta.y, moveDelta.x);

      this.position = this.position.add(moveDelta.x, moveDelta.y);

      if (this.initialPosition instanceof Vector) {
        let movedDistance = new Vector(this.initialPosition.x - this.position.x, this.initialPosition.y - this.position.y).length;
        movedDistance += this._sinShiftDistanceOffset;

        const shift = (movedDistance % this.MOVEMENT_WAVE_LENGTH) / this.MOVEMENT_WAVE_LENGTH;

        const sinShift = 0.5 * Math.sin(shift * 2 * Math.PI);
        this._sinShift = new Vector(0, sinShift).rotate(moveDirectionRad);
      }
  
      if (this.hasCompletedMove && !this.hasStartedExploding) {
        this.explode();
      }
    }
  }

  public render (renderer: Renderer, ctx: CanvasRenderingContext2D): void {
    super.render(renderer, ctx);

    renderer.paintChar(ctx, {
      char: this.char,
      textColor: "white",
      worldPosition: this.position.add(this._sinShift.x, this._sinShift.y)
    });
  }
}