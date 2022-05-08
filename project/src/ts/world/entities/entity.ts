import { FrameObject, Texture } from "pixi.js";
import { GraphicsLayer } from "@graphics/graphics";
import MoveableSprite from "@graphics/moveable-sprite";
import Vector from "@core/vector";

export default abstract class Entity extends MoveableSprite {
  public layer: GraphicsLayer = GraphicsLayer.Entities;
  public speed: number = 1;
  public isHostile: boolean = false;

  protected _target: Vector | null = null;

  public abstract readonly name: string;

  constructor (textures: Texture[] | FrameObject[]) {
    super(textures);
  }

  public updateEntity (delta: number): void {
    super.updateSprite(delta);
  }
}