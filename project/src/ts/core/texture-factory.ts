import Renderer from "../core/renderer";
import Canvas from "./canvas";
import Color from "./color";
import Texture from "./texture";
import Vector from "./vector";

export default class TextureFactory {
  public static readonly TRANSPARENCY_COLOR: Color | null = Color.fromHex("#f91581");

  private _textures: Texture[] = [];
  private _textureSize: number;

  public get textures (): Texture[] {
    return this._textures;
  }

  constructor (textureSize: number) {
    this._textures = [];
    this._textureSize = textureSize;
  }

  public async loadTexturesFromImage (map: HTMLImageElement): Promise<Texture[]> {
    const canvas = new Canvas(map.width, map.height);

    while (!canvas.ctx) {
      // Do nothing
    }

    canvas.ctx.drawImage(map, 0, 0, map.width, map.height);

    // Extract pixel data for each texture
    const textures = [];

    for (let y = 0; y < map.height / this._textureSize; y++) {
      for (let x = 0; x < map.width / this._textureSize; x++) {
        const imgData = canvas.ctx.getImageData(x * this._textureSize, y * this._textureSize, this._textureSize, this._textureSize);
        const pixels = imgData.data;

        for (let p = 0; p < pixels.length; p += 4) {
          if (pixels[p + 0] === TextureFactory.TRANSPARENCY_COLOR?.r &&
              pixels[p + 1] === TextureFactory.TRANSPARENCY_COLOR?.g &&
              pixels[p + 2] === TextureFactory.TRANSPARENCY_COLOR?.b) {
            pixels[p + 3] = 0;
          }
        }

        const image = await Renderer.generateImageFromData(imgData);
        const textureSize = new Vector(this._textureSize, this._textureSize);
        const texture = new Texture(textureSize, image, imgData);
        
        textures.push(texture);
      }
    }

    return textures;
  }

  public loadTexturesFromFile (src: string): Promise<Texture[]> {
    return new Promise((resolve, reject) => {
      const image = new Image();
  
      image.onload = (e) => {
        this.loadTexturesFromImage(image).then((textures: Texture[]) => {
          resolve(textures);
        });
      };
      image.onerror = (e) => {
        reject(e);
      };
      image.src = src;
    });
  }
}