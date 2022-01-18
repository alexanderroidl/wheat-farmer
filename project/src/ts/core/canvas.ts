export default class Canvas {
  private _element: HTMLCanvasElement;
  protected _ctx: CanvasRenderingContext2D;

  public get element (): HTMLCanvasElement {
    return this._element;
  }

  public get ctx (): CanvasRenderingContext2D {
    return this._ctx;
  }

  public get width (): number {
    return this._element.width;
  }

  public set width (_width: number) {
    this._element.width = _width;
  }

  public get height (): number {
    return this._element.height;
  }

  public set height (height: number) {
    this._element.height = height;
  }

  public get image (): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      this.element.toBlob((blob) => {
        if (!blob) {
          reject();
          return;
        }

        const img = new Image();
        img.onload = function () {
          resolve(img);
        };
        img.src = URL.createObjectURL(blob);
      });
    });
  }

  constructor (width: number = 0, height: number = 0) {
    this._element = document.createElement("canvas");
    this._element.width = width;
    this._element.height = height;

    const ctx = this._element.getContext("2d");
    if (!ctx) {
      throw Error("Canvas 2D context not found");
    }
    this._ctx = ctx;
  }
}