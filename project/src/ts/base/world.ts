import EmptyTile from "../tiles/empty-tile";
import WheatTile from "../tiles/wheat-tile";
import Player from "./player";
import EntityInterface from "../interfaces/entity-interface";
import RobotEntity from "../entities/enemies/robot";
import Vector from "../core/vector";
import Tile from "../tiles/tile";
import BitMath from "../core/bit-math";
import WallTile from "../tiles/wall-tile";
import BombEntity from "../entities/enemies/bomb";
import Entity from "../entities/entity";

export default class World {
  public readonly SIZE: number = 20; // 20x20 world size
  public readonly CENTER: Vector = new Vector(this.SIZE / 2).floor();

  private _tiles: Tile[][];
  private _createdAt: number = Date.now();
  private _player: Player = new Player();
  private _entities: EntityInterface[] = [];
  private _plantedTilesPerMin: number[] = [];
  private _enemyGroupsPerMin: number[] = [];
  private _enemiesScheduledToSpawn: number = 0;

  public get tiles (): Tile[][] {
    return this._tiles;
  }

  public get createdAt (): number {
    return this._createdAt;
  }

  public get player (): Player {
    return this._player;
  }

  public get entities (): EntityInterface[] {
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

  constructor () {
    this._tiles = Array(this.SIZE).fill([]).map(() => {
      return Array(this.SIZE).fill([]).map(() => new EmptyTile());
    });
  }

  public isValidTilePos (x: number, y: number): boolean {
    return this._tiles[y] != null && this._tiles[y][x] != null;
  }

  public onWorldClicked (pos: Vector): boolean {
    return false;
  }

  public scheduleEnemySpawn (count: number = 1): void {
    this._enemiesScheduledToSpawn += count;
  }

  public onTileClicked (pos: Vector): void {
    if (!this.isValidTilePos(pos.x, pos.y)) {
      return;
    }

    let newTile: Tile | null = null;
    const tile = this._tiles[pos.y][pos.x];

    const playerWheatTiles = this._player.items.getItemAmount("Wheat");
    const playerWallTiles = this._player.items.getItemAmount("Wall");

    tile.onClicked();

    // Tile is equipped and clicked tile is empty
    if (tile instanceof EmptyTile &&
        this._player.equipped && this._player.equipped.type instanceof Tile) {
      // Player has wheat tile equipped
      if (this._player.equipped.type instanceof WheatTile) {
        // Player has remaining seeds
        if (playerWheatTiles > 0) {
          this._player.items.decreaseItemAmount("Wheat");
          newTile = new WheatTile();
        }
      }

      // Player has wall tile equipped
      if (this._player.equipped.type instanceof WallTile) {
        if (playerWallTiles > 0) {
          this._player.items.decreaseItemAmount("Wall");
          if (playerWallTiles - 1 === 0) {
            this._player.equipped = this._player.items.getItem("Wheat");
          }

          newTile = new WallTile();
        }
      }
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

        // Replace with empty tile
        newTile = new EmptyTile();
      }
    }

    // Clicked tile is wall tile
    if (tile instanceof WallTile) {
      this._player.items.increaseItemAmount("Wall");

      // Replace with empty tile
      newTile = new EmptyTile();
    }

    // New tile was created
    if (newTile !== null) {
      // Set damage of new tile to damage of old tile
      newTile.damage = tile.damage;

      // Update world
      this._tiles[pos.y][pos.x] = newTile;

      // Created tile is not empty
      if (!(newTile instanceof EmptyTile)) {
        this._plantedTilesPerMin.push(newTile.timeCreated);
      }
    }
  }

  public getSurroundingTileCoords (v: Vector, radius: number = 1, includeSelf: boolean = true): Vector[] {
    const tiles: Vector[] = [];

    for (let y = v.y - BitMath.ceil(radius); y <= v.y + BitMath.ceil(radius); y++) {
      if (!this._tiles[y]) {
        continue;
      }

      for (let x = v.x - BitMath.ceil(radius); x <= v.x + BitMath.ceil(radius); x++) {
        if (!this._tiles[y][x] ||
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
      .rotateDeg(Math.random() * 360)
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

  /**
   * Spawns a robot
   *
   * TODO: Make generic
   *
   * @param [pos] - Position to spawn enemy at (Randomly computed if not given)
   * @param randomShift - Vector to randomly shift position by
   */
  public spawnEntity<E extends EntityInterface> (entity: { new(): E }, pos?: Vector, randomShift?: Vector): E {
    if (!pos) {
      pos = this.getRandomOutsidePos();
    }

    if (!randomShift) {
      randomShift = new Vector(Math.random() * 3, Math.random() * 3);
    }

    const shiftVector = new Vector(
      Math.random() * randomShift.x,
      Math.random() * randomShift.y
    ).rotateDeg(Math.random() * 360);

    pos = pos.add(shiftVector.x, shiftVector.y);

    const spawnedEntity = new entity();
    spawnedEntity.position = pos;
    this._entities.push(spawnedEntity);

    return spawnedEntity;
  }

  public removeEntity (entity: Entity): void {
    this._entities = this._entities.filter((e) => e !== entity);
  }

  public explode (pos: Vector, radius: number, maxRadius: number): void {
    // Get coordinates for surrounding tiles
    const surroundingTileCoords = this.getSurroundingTileCoords(
      pos,
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

      if (tileDestroyed) {
        const emptyTile = new EmptyTile();

        // Add existing damage to new tile
        emptyTile.damage = existingTile.damage + damage;

        // Update world for tile
        this._tiles[tilePos.y][tilePos.x] = emptyTile;
      } else {
        existingTile.damage = existingTile.damage + damage;
      }
    }
  }

  public update (delta: number): void {
    // Remove old planted tiles
    this._plantedTilesPerMin = this._plantedTilesPerMin.filter((timeCreated: number) => {
      return (Date.now() - timeCreated) < 60 * 1000;
    });

    // Remove old enemy groups
    this._enemyGroupsPerMin = this._enemyGroupsPerMin.filter((timeCreated: number) => {
      return (Date.now() - timeCreated) < 60 * 1000;
    });

    // Iterate through world
    for (let y = 0; y < this._tiles.length; y++) {
      for (let x = 0; x < this._tiles[y].length; x++) {
        this._tiles[y][x].update(delta);
      }
    }

    // Iterate existing entities
    for (const entity of this.entities) {
      entity.update(delta);

      // Is bomb and has finished exploding
      if (entity instanceof BombEntity && entity.hasCompletedExplosion) {
        // Remove this entity from list
        this.removeEntity(entity);

        const entityWorldPos = entity.position.floor();
        const radius = BitMath.floor(Math.random() * (BombEntity.MAX_EXPLOSION_RADIUS + 1));
        
        this.explode(entityWorldPos, radius, BombEntity.MAX_EXPLOSION_RADIUS);
      }

      // Is robot and has prepared bomb plant
      if (entity instanceof RobotEntity && entity.hasCompletedBombPlant) {
        // Robot has not planted bomb yet
        if (!entity.bomb) {
          // Create and ignite bomb
          entity.bomb = this.spawnEntity(BombEntity, entity.position.add(0, 0.5), new Vector(0.5, 0.5));
          entity.bomb.ignite();

          // Start running away
          entity.target = this.getRandomOutsidePos(7);
          entity.speed = 3 * entity.speed;
        }

        // Has completed running away
        if (entity.hasCompletedMove) {
          this.removeEntity(entity);
        }
      }
    }

    // Spawn enemies scheduled to spawn
    while (this._enemiesScheduledToSpawn > 0) {
      this._enemiesScheduledToSpawn--;

      const robotEntity = this.spawnEntity(RobotEntity);

      const wheatTilePosition = this.getRandomWheatPosition();
      robotEntity.target = wheatTilePosition ? wheatTilePosition : this.randomPosition;
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