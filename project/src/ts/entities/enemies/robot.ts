import Entity from "../entity";

export default class RobotEntity extends Entity {
  public readonly EXPLODE_TIME = 3 * 1000;
  public readonly MAX_EXPLOSION_RADIUS = 2;

  public readonly name: string = "Robot";
  public readonly speed: number = 2;
  
  public isHostile: boolean = true;

  private _explodedAt: number | null = null;

  public get explosionProgress (): number {
    if (this._explodedAt === null) {
      return 0;
    }
      
    const progress = (Date.now() - this._explodedAt) / this.EXPLODE_TIME;
    return progress > 1 ? 1 : progress;
  }

  public get hasCompletedExplosion (): boolean {
    return this.explosionProgress === 1;
  }

  constructor (x: number, y: number) {
    super(x, y);
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
      this.position = this.position.add(moveDelta.x, moveDelta.y);


    if (this.hasCompletedMove && this._explodedAt === null) {
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