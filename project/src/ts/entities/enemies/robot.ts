import Entity from "../entity";
import Vector from "../../core/vector";
import Texture from "../../base/texture";
import Renderer from "../../base/renderer";
import BombEntity from "./bomb";

export default class RobotEntity extends Entity {
  public static readonly MOVEMENT_WAVE_LENGTH = new Vector(10).length;
  public static readonly BOMB_PLANT_TIME = 2000;
  public readonly name: string = "Robot";

  public speed: number = 1;
  public isHostile: boolean = true;
  public bomb: BombEntity | null = null;
  private _bombPlantedAt: number | null = null;
  private _sinShift: Vector = new Vector(0);
  private _sinShiftDistanceOffset: number;

  public get textureId (): number {
    if (this.hasStartedBombPlant) {
      return 16;
    }
    if (!this.isMoving) {
      return 13;
    }
    return this.movedDistance % 1 < 0.5 ? 14 : 15;
  }

  public get bombPlantProgress (): number {
    if (this._bombPlantedAt === null) {
      return 0;
    }
      
    const progress = (Date.now() - this._bombPlantedAt) / RobotEntity.BOMB_PLANT_TIME;
    return progress > 1 ? 1 : progress;
  }

  public get hasStartedBombPlant (): boolean {
    return this._bombPlantedAt !== null;
  }

  public get hasCompletedBombPlant (): boolean {
    return this.bombPlantProgress === 1;
  }

  constructor () {
    super();

    this._sinShiftDistanceOffset = Math.random() * RobotEntity.MOVEMENT_WAVE_LENGTH;
  }

  public plantBomb (): void {
    this._bombPlantedAt = Date.now();
  }

  public update (delta: number): void {
    if (!this.isMoving) {
      return;
    }

    const moveDelta = this.move(delta);
    const moveDirectionRad = Math.atan2(moveDelta.y, moveDelta.x);

    this.position = this.position.add(moveDelta.x, moveDelta.y);

    if (this.initialPosition instanceof Vector) {
      const movedDistance = this.movedDistance + this._sinShiftDistanceOffset;

      const shift = (movedDistance % RobotEntity.MOVEMENT_WAVE_LENGTH) / RobotEntity.MOVEMENT_WAVE_LENGTH;

      const sinShift = 0.5 * Math.sin(shift * 2 * Math.PI);
      this._sinShift = new Vector(0, sinShift).rotate(moveDirectionRad);
    }

    if (this.hasCompletedMove && !this.hasStartedBombPlant) {
      this.plantBomb();

      // Delete target
      this.target = null;
      // Add sinus shift to position
      this.position = this.position.add(this._sinShift.x, this._sinShift.y);
      // Reset sinus shift entirely
      this._sinShift = new Vector(0);
      this._sinShiftDistanceOffset = 0;
    }
  }

  public render (renderer: Renderer, ctx: CanvasRenderingContext2D): void {
    const texture = renderer.getTextureById(this.textureId);

    if (texture instanceof Texture) {
      renderer.paintTexture(ctx, {
        worldPosition: this.position.add(this._sinShift.x, this._sinShift.y),
        texture: texture
      });
    }
  }
}