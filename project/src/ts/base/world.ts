import events from "events";
import { Sprite, Texture } from "pixi.js";
import WheatTile from "../tiles/wheat-tile";
import Player from "./player";
import RobotEntity from "../entities/robot";
import Vector from "../core/vector";
import Tile from "../tiles/tile";
import BitMath from "../core/bit-math";
import WallTile from "../tiles/wall-tile";
import BombEntity from "../entities/bomb";
import Entity from "../entities/entity";
import Graphics from "./graphics";
import MoveableSprite from "../core/moveable-sprite";
import EmptyTile from "../tiles/empty-tile";
import Easings from "../core/easings";
import { OutlineFilter } from "pixi-filters";
import ExplosionEntity from "../entities/explosion";

export interface WorldTileInfo {
  isHovered: boolean,
  tile: Tile | null,
  worldPos: Vector
}

export interface QueuedTile {
  tile: Tile,
  position: Vector
}

export declare interface World {
  on(event: "spriteAdded", listener: (sprite: Sprite) => void): this;
  on(event: "spriteRemoved", listener: (sprite: Sprite) => void): this;
  on(event: string, listener: () => void): this;
}

export class World extends events.EventEmitter {
  public readonly SIZE: number = 20; // 20x20 world size
  public readonly CENTER: Vector = new Vector(this.SIZE / 2).floor();

  private _graphics: Graphics;
  private _tiles: (Tile|null)[][];
  private _createdAt: number = Date.now();
  private _player: Player = new Player();
  private _entities: Entity[] = [];
  private _plantedTilesPerMin: number[] = [];
  private _enemyGroupsPerMin: number[] = [];
  private _enemiesScheduledToSpawn: number = 0;

  public get tiles (): (Tile|null)[][] {
    return this._tiles;
  }

  public get createdAt (): number {
    return this._createdAt;
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

  public get randomPosition (): Vector {
    return new Vector(Math.random() * this.SIZE, Math.random() * this.SIZE).floor();
  }

  constructor (graphics: Graphics) {
    super();

    this._graphics = graphics;

    this._tiles = Array(this.SIZE).fill([]).map(() => {
      return Array(this.SIZE).fill(null);
    });
  }

  public fillWithEmpty (): void {
    for (let y = 0; y < this.SIZE; y++) {
      for (let x = 0; x < this.SIZE; x++) {
        this.create(EmptyTile, ["notfound 0"], new Vector(x, y));
      }
    }
  }

  public isValidTilePos (pos: Vector): boolean {
    return (pos.y in this._tiles) && (pos.x in this._tiles[pos.y]);
  }

  public onWorldClicked (pos: Vector): boolean {
    return false;
  }

  public scheduleEnemySpawn (count: number = 1): void {
    this._enemiesScheduledToSpawn += count;
  }

  public setTile (pos: Vector, content: Tile | null): void {
    if (!this.isValidTilePos(pos)) {
      return;
    }
    if (this._tiles[pos.y][pos.x] instanceof Sprite) {
      this.emit("spriteRemoved", this._tiles[pos.y][pos.x]);
    }
    this._tiles[pos.y][pos.x] = content;

    if (content instanceof Sprite) {
      this.emit("spriteAdded", content);
    }
  }

  public getTileInfo (x: number, y: number, mouseWorldPos?: Vector): WorldTileInfo {
    let isHovered = false;
    if (mouseWorldPos instanceof Vector) {
      isHovered = BitMath.floor(mouseWorldPos.x) === x && BitMath.floor(mouseWorldPos.y) === y;
    }

    // Get tile from current world coordinates
    const tile = this.tiles[y][x];
    const worldPos = new Vector(x, y);

    return { tile, worldPos, isHovered };
  }

  public iterateTiles (callback: (params: WorldTileInfo) => void, mouseWorldPos?: Vector): void {
    for (let y = 0; y < this.tiles.length; y++) {
      for (let x = 0; x < this.tiles[y].length; x++) {
        const tileInfo = this.getTileInfo(x, y, mouseWorldPos);
        callback(tileInfo);
      }
    }
  }

  public onTileClicked (pos: Vector): void {
    if (!this.isValidTilePos(pos)) {
      return;
    }
    const tile = this._tiles[pos.y][pos.x];

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
      this.create(WheatTile, WheatTile.textureNames, pos);
      //   }
      // }
  
      //   // Player has wall tile equipped
      //   if (this._player.equipped.type instanceof WallTile) {
      //     if (playerWallTiles > 0) {
      //       this._player.items.decreaseItemAmount("Wall");
      //       if (playerWallTiles - 1 === 0) {
      //         this._player.equipped = this._player.items.getItem("Wheat");
      //       }
  
      //       this.create(WallTile, null, pos);
      //     }
      //   }
      // }

      return;
    }

    // Clicked tile is wheat tile
    if (tile instanceof WheatTile) {
      // Wheat is fully grown
      if (tile.growthState >= 1) {
        let seedDrops: number | null = null;

        // If player has no seeds left, always drop
        while (seedDrops === null || playerWheatTiles + seedDrops === 0) {
          seedDrops = tile.dropSeeds();
        }

        this._player.items.setItemAmount("Wheat", playerWheatTiles + seedDrops);
        this._player.items.wheat += 1;

        this.emit("spriteRemoved", tile);

        // Replace with empty tile
        this._tiles[pos.y][pos.x] = null;
      }
    }

    // Clicked tile is wall tile
    if (tile instanceof WallTile) {
      this._player.items.increaseItemAmount("Wall");

      // Replace with empty tile
      this._tiles[pos.y][pos.x] = null;
    }
  }

  public getSurroundingTileCoords (v: Vector, radius: number = 1, includeSelf: boolean = true): Vector[] {
    const tiles: Vector[] = [];

    for (let y = v.y - BitMath.ceil(radius); y <= v.y + BitMath.ceil(radius); y++) {
      if (!this._tiles[y]) {
        continue;
      }

      for (let x = v.x - BitMath.ceil(radius); x <= v.x + BitMath.ceil(radius); x++) {
        if (!(x in this._tiles[y]) ||
          (x === v.x && y === v.y && !includeSelf) ||
          new Vector(v.x - x, v.y - y).length > BitMath.ceil(radius)) {
          continue;
        }

        tiles.push(new Vector(x, y));
      }
    }

    return tiles;
  }

  public getRandomOutsidePos (radiusMultiplier: number = 3): Vector {
    const spawnRadius = this.CENTER.length * radiusMultiplier;

    // Set position randomly around the game area
    return new Vector(spawnRadius, 0)
      .rotate(Math.random() * 2 * Math.PI)
      .add(this.CENTER.x, this.CENTER.y);
  }

  public getRandomWheatPosition (): Vector | null {
    const wheatTilePositions = [];

    for (let y = 0; y < this._tiles.length; y++) {
      for (let x = 0; x < this._tiles[y].length; x++) {
        const tile = this._tiles[y][x];
       
        if (tile instanceof WheatTile) {
          wheatTilePositions.push(new Vector(x, y));
        }
      }
    }

    if (!wheatTilePositions.length) {
      return null;
    }

    return wheatTilePositions[BitMath.floor(Math.random() * wheatTilePositions.length)];
  }

  public create <A extends MoveableSprite> (moveableSprite: { new(textures: Texture[]): A }, textureNames: string[] | null, pos: Vector): A {
    const allTextures = [];

    if (textureNames) {
      const textures = this._graphics.getTextures(textureNames);
      for (const texture of textures) {
        if (texture) {
          allTextures.push(texture);
        }
      }
    } else {
      allTextures.push(Texture.EMPTY);
    }

    const newSprite = new moveableSprite(allTextures);
    newSprite.position.set(pos.x, pos.y);

    newSprite.on("mouseover", () => {
      newSprite.filters = [new OutlineFilter(2, 0xffffff)];
    });

    newSprite.on("mouseout", () => {
      newSprite.filters = [];
    });

    if (newSprite instanceof Entity) {
      this._entities.push(newSprite);
      this.emit("spriteAdded", newSprite);
    }

    if (newSprite instanceof Tile) {
      const oldTile = this.tiles[pos.y][pos.x];
      if (oldTile) {
        newSprite.damage = oldTile.damage;

        const damageSprites = oldTile.getDamageSprites();
        newSprite.addDamageSprite(...damageSprites);
      }
  
      this._plantedTilesPerMin.push(newSprite.age);
      this.setTile(pos, newSprite);
    }

    return newSprite;
  }

  public removeEntity (entity: Entity): void {
    this._entities = this._entities.filter((e) => e !== entity);
    this.emit("spriteRemoved", entity);
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
      const damage = 1 - (distance / (maxRadius + 1));
      const tileDestroyed = Math.random() * maxRadius / (distance + 1) > 0.5;
      const existingTile = this._tiles[tilePos.y][tilePos.x];
      const totalDamage = (existingTile?.damage ?? 0) + damage;
      const damageSprites = this.createDamageSprites(damage);

      for (const sprite of damageSprites) {
        sprite.x += tilePos.x;
        sprite.y += tilePos.y;
      }

      let target: Tile | null = null;
      // If tile has been destroyed or no existing tile was found at position
      if (tileDestroyed || !existingTile) {
        const emptyTile = this.create(EmptyTile, null, tilePos);
        target = emptyTile;
      } else { // Tile had existed before and has not been destroyed
        target = existingTile;
      }

      target.damage = totalDamage;
      if (damageSprites) {
        target.addDamageSprite(...damageSprites);
      }
    }

    this.create(ExplosionEntity, ExplosionEntity.textureNames, pos);
  }

  public createDamageSprites (damage: number): Sprite[] {
    const sprites = [];
    const damageTextureCount = BitMath.floor(damage * 3) + 1;

    for (let i = 0; i < damageTextureCount; i++) {
      const textureIdOffset = BitMath.floor(Math.random() * 4);
      const worldOffset = new Vector(Math.random() - 0.5, Math.random() - 0.5).multiply(Graphics.SQUARE_SIZE);
      const size = (1 + Easings.easeInCubic(Math.random()) * 2 * damage);
      const texture = this._graphics.getTexture(`damage ${textureIdOffset}`);
      const sprite = new MoveableSprite([texture]);
      
      sprite.scale.set(size);
      sprite.anchor.set(0.5);
      sprite.alpha = Math.random() * 0.65 * damage;
      sprite.rotation = Math.random() * Math.PI * 2;
      sprite.position.set(worldOffset.x, worldOffset.y);

      sprites.push(sprite);
    }

    return sprites;
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
    for (let y = 0; y < this._tiles.length; y++) {
      for (let x = 0; x < this._tiles[y].length; x++) {
        const tile = this._tiles[y][x];
        if (tile) {
          tile.updateTile(delta);

          // Remove empty tile instances once they are fully recovered from damage
          // if (tile instanceof EmptyTile && tile.damage === 0) {
          //   this.setTile(new Vector(x, y), null);
          // }
        }
      }
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
          entity.bomb = this.create(BombEntity, BombEntity.textureNames, bombPos);
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

      const robotEntity = this.create(RobotEntity, RobotEntity.textureNames, randomPos);
      
      if (Math.random() > 0.25) {
        const hatTextureName = RobotEntity.hatTextures[BitMath.floor(Math.random() * RobotEntity.hatTextures.length)];
        const hatTexture = this._graphics.getTexture(hatTextureName);
        robotEntity.giveHat(hatTexture);
      }

      const wheatTilePosition = this.getRandomWheatPosition();
      robotEntity.moveTarget = wheatTilePosition ? wheatTilePosition : this.randomPosition;
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
}