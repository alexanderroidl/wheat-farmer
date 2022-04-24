import { Texture } from "pixi.js";
import { Textures } from "../base/textures";
import Easings from "../core/easings";
import MoveableSprite from "../core/moveable-sprite";
import Vector from "../core/vector";
import BombEntity from "./bomb";
import Entity from "./entity";

export default class RobotEntity extends Entity {
  public static readonly movementWaveLength = new Vector(10).length;
  public static readonly bombPlantTime = 2000;

  public name: string = "Robot";
  public speed: number = 1.75 + Math.random() * 0.75;
  public isHostile: boolean = true;
  public bomb: BombEntity | null = null;
  public clicked: boolean = false;

  private _bombPlantedAt: number | null = null;
  private _sinAmplifier: number = Math.random() * 0.75;
  private _sinShiftDistanceOffset: number = Math.random() * RobotEntity.movementWaveLength;

  public get bombPlantProgress (): number {
    if (this._bombPlantedAt === null) {
      return 0;
    }
      
    const progress = (Date.now() - this._bombPlantedAt) / RobotEntity.bombPlantTime;
    return progress > 1 ? 1 : progress;
  }

  public get hasStartedBombPlant (): boolean {
    return this._bombPlantedAt !== null;
  }

  public get hasCompletedBombPlant (): boolean {
    return this.bombPlantProgress === 1;
  }

  constructor () {
    const randomTextureGroupMultiplier = Easings.easeInCubic(Math.random());
    const textureGroups: Texture[][] = Object.values(Textures.robot);
    const textures = textureGroups[Math.floor(textureGroups.length * randomTextureGroupMultiplier)];

    super(textures);

    this.on("click", (e) => {
      this.play();
    });
  }

  public giveHat (texture: Texture): void {
    const hat = new MoveableSprite([texture]);
    this.addChild(hat);
  }

  public plantBomb (): void {
    this._bombPlantedAt = Date.now();
  }

  public updateEntity (delta: number): void {
    const position = new Vector(this.x, this.y);
    super.updateEntity(delta);

    // Calculate moved distance
    const moveDelta = new Vector(this.x, this.y).substract(position);

    // Has moved
    if (moveDelta.length > 0) {
      const moveDirectionRad = Math.atan2(moveDelta.y, moveDelta.x);
      const movedDistance = this.movedDistance + this._sinShiftDistanceOffset;

      const shift = (movedDistance % RobotEntity.movementWaveLength) / RobotEntity.movementWaveLength;

      const sinShiftY = (0.5 + this._sinAmplifier) * Math.sin(shift * 2 * Math.PI);
      this.renderOffset = new Vector(0, sinShiftY).rotate(moveDirectionRad);
    }

    // Has completed movement and hasn't planted bomb yet
    if (this.moveHasCompleted && !this.hasStartedBombPlant) {
      this.plantBomb();

      // Delete target
      this.moveTarget = null;

      // Add sinus shift to position
      this.position.set(this.x + this.renderOffset.x, this.y + this.renderOffset.y);

      // Reset sinus shift entirely
      this.renderOffset = new Vector(0);
      this._sinShiftDistanceOffset = 0;
    }
  }
}