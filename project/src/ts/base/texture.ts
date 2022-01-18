import Vector from "../core/vector";

export default class Texture {
  private _size: Vector;
  private _image: HTMLImageElement;
  private _lowResTexture: Texture | null = null;

  public get size (): Vector {
    return this._size;
  }

  public get image (): HTMLImageElement {
    return this._image;
  }

  public set lowResTexture (lowResTexture: Texture) {
    this._lowResTexture = lowResTexture;
  }

  public getForScreenWidth (screenWidth: number): Texture {
    if (this._lowResTexture && screenWidth < this.size.x / 2) {
      return this._lowResTexture.getForScreenWidth(screenWidth);
    }

    return this;
  }
  
  constructor (size: Vector, image: HTMLImageElement) {
    this._size = size;
    this._image = image;
  }
}
