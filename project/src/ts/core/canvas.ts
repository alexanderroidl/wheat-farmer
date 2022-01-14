export default class Canvas {
  private _element: HTMLCanvasElement;
  protected _ctx: CanvasRenderingContext2D | null;

  public get element (): HTMLCanvasElement {
    return this._element;
  }

	public get ctx(): CanvasRenderingContext2D | null {
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
        img.onload = function() {
          resolve(img);
        };
        img.src = URL.createObjectURL(blob);
      });
    });
  }

	constructor (width?: number, height?: number) {
		this._element = this._createElement(width, height);
		this._ctx = this._element.getContext("2d");
	}

	private _createElement(width?: number, height?: number): HTMLCanvasElement {
		const element = document.createElement("canvas");
		
		if (width) {
      element.width = width;
    }

		if (height) {
      element.height = height;
    }

		return element;
	}
}