import Renderer from "./renderer";
import Texture from "./texture";
import Canvas from "../core/canvas";
import Color from "../core/color";
import Vector from "../core/vector";
import BitMath from "../core/bit-math";

export default class TextureFactory {
  public static readonly TEXTURE_DOWNSCALE_ITERATIONS = 4;
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

  public async createLowResTextures (texture: Texture, imgData: ImageData, textureSize: number): Promise<void> {
    if (textureSize >= this._textureSize / TextureFactory.TEXTURE_DOWNSCALE_ITERATIONS) {
      textureSize = BitMath.floor(textureSize / 2);

      const lowResSize = new Vector(textureSize);
      const lowResImage = await Renderer.generateImageFromData(imgData, lowResSize);
      const lowResTexture = new Texture(lowResSize, lowResImage);

      texture.lowResTexture = lowResTexture;
      this.createLowResTextures(lowResTexture, imgData, textureSize);
    }
  }

  public async loadTexturesFromImage (map: HTMLImageElement): Promise<Texture[]> {
    const canvas = new Canvas(map.width, map.height);

    while (!canvas.ctx) {
      // Do nothing
    }

    canvas.ctx.drawImage(map, 0, 0, map.width, map.height);

    // Extract pixel data for each texture
    const textures = [];
    const textureSize = new Vector(this._textureSize);

    for (let y = 0; y < map.height / this._textureSize; y++) {
      for (let x = 0; x < map.width / this._textureSize; x++) {
        const imgData = canvas.ctx.getImageData(x * this._textureSize, y * this._textureSize, this._textureSize, this._textureSize);
        const pixels = imgData.data;

        // Remove pixels which equal transparency color
        for (let p = 0; p < pixels.length; p += 4) {
          if (pixels[p + 0] === TextureFactory.TRANSPARENCY_COLOR?.r &&
              pixels[p + 1] === TextureFactory.TRANSPARENCY_COLOR?.g &&
              pixels[p + 2] === TextureFactory.TRANSPARENCY_COLOR?.b) {
            pixels[p + 3] = 0;
          }
        }

        const image = await Renderer.generateImageFromData(imgData, textureSize);
        const texture = new Texture(textureSize, image);
        await this.createLowResTextures(texture, imgData, this._textureSize);
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