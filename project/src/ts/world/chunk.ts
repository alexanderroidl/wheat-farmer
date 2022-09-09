import SimplexNoise from "simplex-noise";
import Vector from "@core/vector";
import { Tile, EmptyTile } from "@world/tiles";
import PalmTile from "./tiles/palm-tile";

export type Chunks = Record<number, Record<number, Chunk>>;

export class Chunk {
  public static readonly WIDTH: number = 9;
  public static readonly HEIGHT: number = 9;
  public static readonly SIZE: number = Chunk.WIDTH * Chunk.HEIGHT;
  public static readonly DIMENSIONS = new Vector(Chunk.WIDTH, Chunk.HEIGHT);

  public position: Vector;
  private _loaded?: boolean;
  private _tiles: Tile[];

  constructor (position: Vector, simplex: SimplexNoise) {
    this.position = position;
    this._tiles = this.generateTiles(simplex);
    this.loaded = true;
  }

  public get tiles (): Tile[] {
    return this._tiles;
  }

  public get x (): number {
    return this.position.x;
  }

  public get y (): number {
    return this.position.y;
  }

  public get loaded (): boolean {
    return Boolean(this._loaded);
  }

  public set loaded (loaded: boolean) {
    for (const tile of this._tiles) {
      tile.visible = loaded;
    }
    this._loaded = loaded;
  }

  public getTile (pos: Vector): Tile | null {
    const index = pos.x + pos.y * Chunk.WIDTH;
    return this._tiles[index] ?? null;
  }

  public getTilePosChunkPos (pos: Vector): Vector {
    return new Vector(
      pos.x >= 0 ? pos.x % Chunk.WIDTH : Math.abs(this.x) * Chunk.WIDTH + pos.x,
      pos.y >= 0 ? pos.y % Chunk.HEIGHT : Math.abs(this.y) * Chunk.HEIGHT + pos.y
    ).floor();
  }

  public setTile (pos: Vector, tile: Tile | null): Tile {
    const index = pos.x + pos.y * Chunk.WIDTH;
    if (!(index in this._tiles)) {
      throw `Tile at ${pos} not found`;
    }
    tile = tile ?? new EmptyTile();
    this._tiles[index] = tile;
    tile.visible = this.loaded;
    tile.position.set(this.x * Chunk.WIDTH + pos.x, this.y * Chunk.HEIGHT + pos.y);
    return tile;
  }

  public update (deltaTime: number): void {
    if (!this.loaded) {
      return;
    }

    for (const tile of this._tiles) {
      tile.updateTile(deltaTime);
    }
  }

  private generateTiles (simplex: SimplexNoise): Tile[] {
    const blueNoise: number[][] = [];
    const tiles = [];
    const R = 50;

    const noise = (nx: number, ny: number): number => {
      // Rescale from -1.0:+1.0 to 0.0:1.0
      return simplex.noise2D(nx, ny) / 2 + 0.5;
    };

    for (let y = 0; y < Chunk.HEIGHT; y++) {
      blueNoise[y] = [];

      for (let x = 0; x < Chunk.WIDTH; x++) {
        const nx = (x * this.x) / Chunk.WIDTH - 0.5;
        const ny = (y * this.y) / Chunk.HEIGHT - 0.5;

        // blue noise is high frequency; try varying this
        blueNoise[y][x] = noise(50 * nx, 50 * ny);
      }
    }

    for (let yc = 0; yc < Chunk.HEIGHT; yc++) {
      for (let xc = 0; xc < Chunk.WIDTH; xc++) {
        const generatedTileIndex = xc + yc * Chunk.WIDTH;
        let max = 0;

        for (let yn = yc - R; yn <= yc + R; yn++) {
          for (let xn = xc - R; xn <= xc + R; xn++) {
            if (0 <= yn && yn < Chunk.HEIGHT && 0 <= xn && xn < Chunk.WIDTH) {
              const e = blueNoise[yn][xn];

              if (e > max) {
                max = e;
              }
            }
          }
        }

        let generatedTile;
        if (blueNoise[yc][xc] === max) {
          generatedTile = new PalmTile();
        } else {
          generatedTile = new EmptyTile();
        }

        generatedTile.position.set(
          this.x * Chunk.WIDTH + xc,
          this.y * Chunk.HEIGHT + yc
        );

        tiles[generatedTileIndex] = generatedTile;
      }
    }

    return tiles;
  }
}