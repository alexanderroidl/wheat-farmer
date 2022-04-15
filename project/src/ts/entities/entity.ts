import Vector from "../core/vector";
import IRenderable from "../interfaces/renderable";
import MoveableSprite from "../core/moveable-sprite";
import { FrameObject, Texture } from "pixi.js";

export default class Entity extends MoveableSprite implements IRenderable {
  protected _target: Vector | null = null;

  public interactive: boolean = true;
  public speed: number = 1;
  public isHostile: boolean = false;

  constructor (textures: Texture[] | FrameObject[]) {
    super(textures);
  }

  public updateEntity (delta: number): void {
    super.updateSprite(delta);
  }
}