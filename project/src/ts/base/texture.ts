import Vector from "../core/vector";

export default class Texture {
  private _size: Vector;
  private _image: HTMLImageElement;
  private _data: ImageData;

  public get size (): Vector {
    return this._size;
  }

  public get image (): HTMLImageElement {
    return this._image;
  }

  public get data (): ImageData {
    return this._data;
  }
  
  constructor (size: Vector, image: HTMLImageElement, data: ImageData) {
    this._size = size;
    this._image = image;
    this._data = data;
  }
}
