import Vector from "../core/vector";

export default class Mouse {
  public position: Vector = new Vector(0, 0);
  public pressed: boolean = false;
}