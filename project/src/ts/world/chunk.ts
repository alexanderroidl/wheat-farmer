import Vector from "@core/vector";
import { Tile, EmptyTile } from "@world/tiles";

export type Chunks = Record<number, Record<number, Chunk>>;

export class Chunk {
  public static readonly WIDTH: number = 9;
  public static readonly HEIGHT: number = 9;
  public static readonly SIZE: number = Chunk.WIDTH * Chunk.HEIGHT;
  public static readonly DIMENSIONS = new Vector(Chunk.WIDTH, Chunk.HEIGHT);

  public position: Vector;
  private _loaded?: boolean;
  private _tiles: Tile[];

  constructor (position: Vector) {
    this.position = position;
    this._tiles = this.generateTiles();
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

  private generateTiles (): Tile[] {
    return new Array(Chunk.SIZE).fill(null).map((tile, tileIndex) => {
      const emptyTile = new EmptyTile();
      const x = tileIndex % Chunk.WIDTH;
      const y = Math.floor(tileIndex / Chunk.WIDTH);
      emptyTile.position.set(this.x * Chunk.WIDTH + x, this.y * Chunk.HEIGHT + y);
      return emptyTile;
    });
  }
}