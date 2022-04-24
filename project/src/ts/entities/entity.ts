import { FrameObject, Texture } from "pixi.js";
import MoveableSprite from "../core/moveable-sprite";
import Vector from "../core/vector";
import IRenderable from "../interfaces/renderable";

export default abstract class Entity extends MoveableSprite implements IRenderable {
  protected _target: Vector | null = null;

  public interactive: boolean = true;
  public speed: number = 1;
  public isHostile: boolean = false;
  public get zIndex (): number {
    return 9999;
  }

  constructor (textures: Texture[] | FrameObject[]) {
    super(textures);
  }

  public updateEntity (delta: number): void {
    super.updateSprite(delta);
  }
}