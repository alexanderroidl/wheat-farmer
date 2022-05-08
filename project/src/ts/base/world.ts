import Easings from "@core/easings";
import events from "events";
import BitMath from "../core/bit-math";
import MoveableSprite from "../core/moveable-sprite";
import Vector from "../core/vector";
import BombEntity from "../entities/bomb";
import Entity from "../entities/entity";
import ExplosionEntity from "../entities/explosion";
import RobotEntity from "../entities/robot";
import EmptyTile from "../tiles/empty-tile";
import Tile from "../tiles/tile";
import WallTile from "../tiles/wall-tile";
import WheatTile from "../tiles/wheat-tile";
import { Chunk, Chunks } from "./chunk";
import DamageEntity from "@entities/damage";
import Player from "./player";

export declare interface World {
  on(event: "createdSprites", listener: (sprites: MoveableSprite[]) => void): this;
  on(event: "removedSprites", listener: (sprites: MoveableSprite[]) => void): this;
  on(event: string, listener: () => void): this;
}

export class World extends events.EventEmitter {
  private _chunks: Chunks = {};
  private _player: Player = new Player();
  private _entities: Entity[] = [];
  private _plantedTilesPerMin: number[] = [];
  private _enemyGroupsPerMin: number[] = [];
  private _enemiesScheduledToSpawn: number = 0;

  constructor () {
    super();
  }

  public get player (): Player {
    return this._player;
  }

  public get entities (): Entity[] {
    return this._entities;
  }

  public get tilesPlantedPerMin (): number {
    return this._plantedTilesPerMin.length;
  }

  public get enemyGroupsPerMin (): number {
    return this._enemyGroupsPerMin.length;
  }

  public initChunks (): void {
    for (let y = -1; y < 2; y++) {
      for (let x = -1; x < 2; x++) {
        this.newChunkAt(new Vector(x, y));
      }
    }
  }

  public getRandomLoadedPosition (): Vector {
    const chunks = this.getChunks(true);
    const randomChunk = chunks[Math.floor(chunks.length * Math.random())];
    const randomPosition = Math.floor(Chunk.SIZE * Math.random());

    return new Vector(
      randomChunk.position.x * Chunk.WIDTH + randomPosition % Chunk.WIDTH,
      randomChunk.position.y * Chunk.HEIGHT + Math.floor(randomPosition / Chunk.WIDTH)
    );
  }

  public scheduleEnemySpawn (count: number = 1): void {
    this._enemiesScheduledToSpawn += count;
  }

  public getTile (pos: Vector): Tile | null {
    const chunkPos = this.getChunkPos(pos);
    const chunk = this.getChunk(chunkPos) ?? this.newChunkAt(chunkPos);
    return chunk.getTile(chunk.getTilePosChunkPos(pos));
  }

  public setTile (pos: Vector, tile: Tile | null): Tile {
    const chunkPos = pos.divide(new Vector(Chunk.WIDTH, Chunk.HEIGHT)).floor();
    const chunk = this.getChunk(chunkPos);
    if (!chunk) {
      throw `Chunk ${chunkPos} not found`;
    }

    const chunkTilePos = chunk.getTilePosChunkPos(pos);
    const existingTile = chunk.getTile(chunkTilePos);

    if (existingTile) {
      this.emit("removedSprites", [existingTile]);
    }

    const tileUsed = chunk.setTile(chunkTilePos, tile);
    this.emit("createdSprites", [tileUsed]);
    return tileUsed;
  }

  public onTileClicked (pos: Vector): void {
    const tile = this.getTile(pos);

    const playerWheatTiles = this._player.items.getItemAmount("Wheat");
    // const playerWallTiles = this._player.items.getItemAmount("Wall");

    if (tile == null || tile instanceof EmptyTile) {
      // // Tile is equipped and clicked tile is empty
      // if (this._player.equipped && this._player.equipped.type instanceof Tile) {
      //   // Player has wheat tile equipped
      //   if (this._player.equipped.type instanceof WheatTile) {
      //     // Player has remaining seeds
      //     if (playerWheatTiles > 0) {
      //       this._player.items.decreaseItemAmount("Wheat");
      this.create(WheatTile, pos);
      //   }
      // }

      //   // Player has wall tile equipped
      //   if (this._player.equipped.type instanceof WallTile) {
      //     if (playerWallTiles > 0) {
      //       this._player.items.decreaseItemAmount("Wall");
      //       if (playerWallTiles - 1 === 0) {
      //         this._player.equipped = this._player.items.getItem("Wheat");
      //       }

      //       this.create(WallTile, pos);
      //     }
      //   }
      // }

      return;
    }

    // Clicked tile is wheat tile
    if (tile instanceof WheatTile) {
      // Wheat is fully grown
      if (tile.growthRate >= 1) {
        let seedDrops: number | null = null;

        // If player has no seeds left, always drop
        while (seedDrops === null || playerWheatTiles + seedDrops === 0) {
          seedDrops = tile.dropSeeds();
        }

        this._player.items.setItemAmount("Wheat", playerWheatTiles + seedDrops);
        this._player.items.wheat += 1;

        this.emit("removedSprites", [tile]);

        // Replace with empty tile
        this.setTile(pos, null);
      }
    }

    // Clicked tile is wall tile
    if (tile instanceof WallTile) {
      this._player.items.increaseItemAmount("Wall");

      // Replace with empty tile
      this.setTile(pos, null);
    }
  }

  public getSurroundingTileCoords (v: Vector, radius: number = 1, includeSelf: boolean = true): Vector[] {
    const tiles: Vector[] = [];

    for (let y = v.y - BitMath.ceil(radius); y <= v.y + BitMath.ceil(radius); y++) {
      for (let x = v.x - BitMath.ceil(radius); x <= v.x + BitMath.ceil(radius); x++) {
        if ((x === v.x && y === v.y && !includeSelf) ||
          new Vector(v.x - x, v.y - y).length > BitMath.ceil(radius)) {
          continue;
        }

        tiles.push(new Vector(x, y));
      }
    }

    return tiles;
  }

  public getRandomOutsidePos (radiusMultiplier: number = 3): Vector {
    // TODO: Replace static values
    const spawnRadius = Math.sqrt(Math.pow(10, 2) + Math.pow(10, 2)) * radiusMultiplier;

    // Set position randomly around the game area
    return new Vector(spawnRadius, 0)
      .rotate(Math.random() * 2 * Math.PI)
      .add(10, 10);
  }

  public getRandomWheatPosition (): Vector | null {
    const wheatTilePositions = [];
    const loadedChunks = this.getChunks(true);

    for (const chunk of loadedChunks) {
      for (const tile of chunk.tiles) {
        if (tile instanceof WheatTile) {
          wheatTilePositions.push(new Vector(tile.position.x, tile.position.y));
        }
      }
    }

    if (!wheatTilePositions.length) {
      return null;
    }

    return wheatTilePositions[BitMath.floor(Math.random() * wheatTilePositions.length)];
  }

  public create <A extends MoveableSprite> (moveableSprite: { new(): A }, pos: Vector): A {
    const newSprite = new moveableSprite();

    if (newSprite instanceof Entity) {
      this._entities.push(newSprite);
      this.emit("createdSprites", [newSprite]);
    }

    if (newSprite instanceof Tile) {
      const oldTile = this.getTile(pos);

      if (oldTile) {
        newSprite.damage = oldTile.damage;
        newSprite.addDamageSprites(...oldTile.damageEntities);
      }

      if (!(newSprite instanceof EmptyTile)) {
        this._plantedTilesPerMin.push(newSprite.age);
      }

      this.setTile(pos, newSprite);
    } else {
      newSprite.position.set(pos.x, pos.y);
    }

    return newSprite;
  }

  public removeEntity (entity: Entity): void {
    this._entities = this._entities.filter((e) => e !== entity);
    this.emit("removedSprites", [entity]);
  }

  public createExplosion (pos: Vector, radius: number, maxRadius: number): void {
    const worldPos = pos.floor();
    // Get coordinates for surrounding tiles
    const surroundingTileCoords = this.getSurroundingTileCoords(
      worldPos,
      radius
    );

    // Iterate through surrounding tile coordinates
    for (const tilePos of surroundingTileCoords) {
      // Calculate distance to surrounding tile
      const distance =
        tilePos
          .add(0.5, 0.5)
          .add(
            -(pos.x + 0.5),
            -(pos.y + 0.5)
          ).length;

      // Calculate damage and restrict to values between 0-1
      const damage = (1 - distance / (maxRadius + 1)) * Easings.easeOutQuart(Math.random());
      const tileDestroyed = Math.random() * maxRadius / (distance + 1) > 0.5;
      const existingTile = this.getTile(tilePos);
      const totalDamage = (existingTile?.damage ?? 0) + damage;
      const damageSprites = this.createDamageEntities(damage);

      for (const damageSprite of damageSprites) {
        damageSprite.x += tilePos.x;
        damageSprite.y += tilePos.y;
      }

      let target: Tile | null = null;
      // If tile has been destroyed or no existing tile was found at position
      if (tileDestroyed || !existingTile) {
        target = this.create(EmptyTile, tilePos);
      } else { // Tile had existed before and has not been destroyed
        target = existingTile;
      }

      target.damage = totalDamage;
      if (damageSprites) {
        this.emit("createdSprites", damageSprites);
        target.addDamageSprites(...damageSprites);
      }
    }

    this.create(ExplosionEntity, pos.substract(0.5));
  }

  public createDamageEntities (damage: number): DamageEntity[] {
    const damageTextureCount = BitMath.floor(damage * 3) + 1;
    return damageTextureCount <= 0 ? [] : Array(damageTextureCount).fill(null).map(() => {
      return new DamageEntity(damage);
    });
  }

  public update (delta: number): void {
    // Remove old planted tiles
    this._plantedTilesPerMin = this._plantedTilesPerMin.map(a => a + delta).filter((age: number) => {
      return age < 60 * 1000;
    });

    // Remove old enemy groups
    this._enemyGroupsPerMin = this._enemyGroupsPerMin.filter((timeCreated: number) => {
      return (Date.now() - timeCreated) < 60 * 1000;
    });

    // Iterate through world
    const chunks = this.getChunks(true);
    for (const chunk of chunks) {
      chunk.update(delta);
    }

    // Iterate existing entities
    for (const entity of this.entities) {
      entity.updateEntity(delta);

      if (entity instanceof ExplosionEntity && entity.completed) {
        this.removeEntity(entity);
      }

      // Is bomb and has finished exploding
      if (entity instanceof BombEntity && entity.hasCompletedExplosion) {
        // Remove this entity from list
        this.removeEntity(entity);

        const entityWorldPos = new Vector(entity.x, entity.y);
        const radius = BitMath.floor(Math.random() * (BombEntity.maxExplosionRadius + 1));

        this.createExplosion(entityWorldPos, radius, BombEntity.maxExplosionRadius);
      }

      // Is robot and has prepared bomb plant
      if (entity instanceof RobotEntity) {
        if (entity.hasStartedBombPlant && !entity.bomb) {
          const bombPos = new Vector(entity.x, entity.y).add(0, 0.5);
          entity.bomb = this.create(BombEntity, bombPos);
        }

        // Robot has not planted bomb yet
        if (entity.hasCompletedBombPlant && !entity.bomb?.playing) {
          entity.bomb?.ignite();

          // Start running away
          entity.moveTarget = this.getRandomOutsidePos(7);
          entity.speed = 1.5 * entity.speed;

          // Has completed running away
          if (entity.moveHasCompleted) {
            this.removeEntity(entity);
          }
        }
      }
    }

    // Spawn enemies scheduled to spawn
    while (this._enemiesScheduledToSpawn > 0) {
      this._enemiesScheduledToSpawn--;

      const shiftVector = new Vector(
        Math.random() * 3,
        Math.random() * 3
      ).rotate(Math.random() * 2 * Math.PI);
      const randomPos = this.getRandomOutsidePos().add(shiftVector);

      const robotEntity = this.create(RobotEntity, randomPos);
      const wheatTilePosition = this.getRandomWheatPosition();
      robotEntity.moveTarget = wheatTilePosition ? wheatTilePosition : this.getRandomLoadedPosition();
    }

    // Start spawning enemies at more than 50 planted tiles/min
    // Add an extra enemy for every additional 25 planted tiles/min
    const enemieGroups = Math.ceil((this.tilesPlantedPerMin - 40) / 10);
    if (enemieGroups > 0) {
      // Calculate spawnable enemie groups
      const spawnableGroupCount = enemieGroups - this.enemyGroupsPerMin;

      if (spawnableGroupCount > 0) {
        // Create each spawnable enemie group
        for (let groupIndex = 0; groupIndex < spawnableGroupCount; groupIndex++) {
          // Determine random group size
          const groupSize = BitMath.floor(Math.random() * 3) + 1;

          // Schedule enemy group to spawn
          this.scheduleEnemySpawn(groupSize);

          // Push time enemy group was created at
          this._enemyGroupsPerMin.push(Date.now());
        }
      }
    }
  }

  private newChunkAt (chunkPos: Vector): Chunk {
    if (!this._chunks[chunkPos.y]) {
      this._chunks[chunkPos.y] = {};
    }
    const chunk = new Chunk(chunkPos);
    chunk.position = new Vector(chunkPos);
    for (const tile of chunk.tiles) {
      this.emit("createdSprites", [tile]);
    }
    this._chunks[chunkPos.y][chunkPos.x] = chunk;
    return chunk;
  }

  private getChunk (chunkPos: Vector): Chunk | null {
    if (!this._chunks[chunkPos.y]) {
      this._chunks[chunkPos.y] = {};
    }
    return this._chunks[chunkPos.y][chunkPos.x] ?? null;
  }

  private getChunkPos (pos: Vector): Vector {
    return pos.divide(new Vector(Chunk.WIDTH, Chunk.HEIGHT)).floor();
  }

  private getChunks (loadedOnly: boolean = false): Chunk[] {
    const chunks = [];
    for (const chunkY in this._chunks) {
      for (const chunkX in this._chunks[chunkY]) {
        const chunk = this._chunks[chunkY][chunkX];
        if (!chunk || loadedOnly && !chunk.loaded) {
          continue;
        }
        chunks.push(chunk);
      }
    }
    return chunks;
  }
}