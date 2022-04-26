import { FrameObject, Texture } from "pixi.js";
import { GraphicsLayer } from "../base/graphics";
import MoveableSprite from "../core/moveable-sprite";
import Vector from "../core/vector";
import IRenderable from "../interfaces/renderable";

export default abstract class Entity extends MoveableSprite implements IRenderable {
  protected _target: Vector | null = null;

  public abstract readonly name: string;
  public layer: GraphicsLayer = GraphicsLayer.Entities;
  public speed: number = 1;
  public isHostile: boolean = false;

  constructor (textures: Texture[] | FrameObject[]) {
    super(textures);
  }

  public updateEntity (delta: number): void {
    super.updateSprite(delta);
  }
}