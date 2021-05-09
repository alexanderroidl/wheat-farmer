import EmptyTile from '../tiles/empty-tile';
import WheatTile from '../tiles/wheat-tile';
import Player from "./player";
import EntityInterface from '../interfaces/entity-interface';
import RobotEntity from '../entities/enemies/robot';
import Vector from '../core/vector';
import Easings from "../core/easings";
import Tile from '../tiles/tile';
import BitMath from '../core/bit-math';

export default class World {
    public readonly SIZE: number = 20   ; // 20x20 world siz
    public readonly CENTER: Vector = new Vector(this.SIZE/2, this.SIZE/2).floor();

    private _tiles: Tile[][];
    private _createdAt: number = Date.now();
    private _player: Player = new Player();
    private _entities: EntityInterface[] = [];
    private _plantedTilesPerMin: number[] = [];
    private _enemyGroupsPerMin: number[] = [];

    get tiles (): Tile[][] {
        return this._tiles;
    }

    get createdAt (): number {
        return this._createdAt;
    }

    get player (): Player {
        return this._player;
    }

    get entities (): EntityInterface[] {
        return this._entities;
    }

    get tilesPlantedPerMin (): number {
        return this._plantedTilesPerMin.length;
    }

    get enemyGroupsPerMin (): number {
        return this._enemyGroupsPerMin.length;
    }

    constructor () {
        this._tiles = Array(this.SIZE).fill([]).map(() => {
            return Array(this.SIZE).fill([]).map(() => new EmptyTile());
        });
    }

    public isValidTilePos (x: number, y: number): boolean {
        return this._tiles[y] != null && this._tiles[y][x] != null;
    }

    public onTileClicked (pos: Vector): void {
        if (!this.isValidTilePos(pos.x, pos.y)) {
            return;
        }

        let newTile: Tile | null = null;
        const tile = this._tiles[pos.y][pos.x];

        tile.onClicked();

        // Clicked tile is empty
        if (tile instanceof EmptyTile) {
            // Player has remaining seeds
            if (this._player.items.wheatSeeds > 0) {
                this._player.items.wheatSeeds--;

                // Replace with wheat tile
                newTile = new WheatTile();
            }
        }

        // Clicked tile is wheat
        if (tile instanceof WheatTile) {
            // Wheat is fully grown
            if (tile.growthState >= 1) {
                let seedDrops: number | null = null;

                // If player has no seeds left, always drop
                while (seedDrops === null || this._player.items.wheatSeeds + seedDrops === 0) {
                    seedDrops = tile.dropSeeds()
                }
                
                this._player.items.wheatSeeds += seedDrops;
                this._player.items.opium += 1;

                // Replace with empty tile
                newTile = new EmptyTile();
            }
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

        for (let y = v.y - Math.ceil(radius); y <= v.y + Math.ceil(radius); y++) {
            if (!this._tiles[y]) {
                continue;
            }

            for (let x = v.x - Math.ceil(radius); x <= v.x + Math.ceil(radius); x++) {
                if (!this._tiles[y][x] || 
                    (x === v.x && y === v.y && !includeSelf) ||
                    new Vector(v.x - x, v.y - y).length > Math.ceil(radius)) {
                    continue;
                }

                tiles.push(new Vector(x, y));
            }
        }

        return tiles;
    }

    public getRandomOutsidePos (): Vector {
        // Make spawn radius twice the game area's diameter
        const spawnRadius = this.CENTER.length * 3;

        // Set position randomly around the game area
        return new Vector(spawnRadius, 0)
            .rotate(Math.random() * 360)
            .add(this.CENTER.x, this.CENTER.y);
    }

    /**
     * Spawns a robot
     * 
     * TODO: Make generic
     * 
     * @param [pos] - Position to spawn enemy at (Randomly computed if not given)
     * @param randomShift - Vector to randomly shift position by
     */
    public spawnEnemy (pos: Vector | null = null, randomShift?: Vector): EntityInterface {
        // No position given
        if (pos === null) {
            pos = this.getRandomOutsidePos();
        }

        if (randomShift) {
            const shiftVector = new Vector(
                Math.random() * randomShift.x,
                Math.random() * randomShift.y
            ).rotate(Math.random() * 360);

            pos = pos.add(shiftVector.x, shiftVector.y);
        }

        const enemy = new RobotEntity(pos.x, pos.y);        
        this._entities.push(enemy);
        
        return enemy;
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
                // Reduce tile damage based off total heal time
                this._tiles[y][x].damage -= delta / Tile.DAMAGE_HEAL_TIME;
            }
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
                    const spawnPos = this.getRandomOutsidePos();

                    // Create each enemy for set group size
                    for (let enemyIndex = 0; enemyIndex < groupSize; enemyIndex++) {
                        const enemy = this.spawnEnemy(spawnPos, new Vector(Math.random() * 3, Math.random() * 3));

                        // Assign random world coordinates as target for spawned enemie
                        enemy.target =  new Vector(Math.random() * this.SIZE, Math.random() * this.SIZE).floor();
                    }

                    // Push time enemy group was created at
                    this._enemyGroupsPerMin.push(Date.now());
                }
            }
        }

        // Iterate existing entities
        for (const entity of this.entities) {
            if (entity instanceof RobotEntity) {
                // Robot is exploding
                if (entity.hasExploded) {
                    // Remove this entity from list
                    this._entities = this._entities.filter((v) => v != entity);

                    const MAX_EXPLOSION_RADIUS = 2;

                    const entityWorldPos = entity.position.floor();

                    // Get coordinates for surrounding tiles
                    const radius = BitMath.floor(Math.random() * (MAX_EXPLOSION_RADIUS + 1))
                    const surroundingTileCoords = this.getSurroundingTileCoords(
                        entityWorldPos, 
                        radius
                    );

                    // Iterate through surrounding tile coordinates
                    for (const tilePos of surroundingTileCoords) {
                        // Calculate distance to surrounding tile
                        const distance = 
                            tilePos
                                .add(0.5, 0.5)
                                .add(
                                    -(entityWorldPos.x + 0.5), 
                                    -(entityWorldPos.y + 0.5)
                                ).length;

                        // Calculate damage and restrict to values between 0-1
                        const damage = 1 - (distance / (MAX_EXPLOSION_RADIUS + 1));

                        const tileDestroyed = Math.random() * MAX_EXPLOSION_RADIUS/(distance + 1) > 0.5;
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
            }

            // Move entity to target
            if (entity.target !== null) {
                if (!entity.isMoving) {
                    entity.isMoving = true;
                    entity.initialPosition = new Vector(entity.position.x, entity.position.y);
                }
    
                let entitySpeed = entity.speed * (delta/1000);
                let distance = new Vector(entity.target.x - entity.position.x, entity.target.y - entity.position.y).length;
    
                if (distance > 0 && entity.initialPosition) {
                    const initialDistance = new Vector(entity.target.x - entity.initialPosition.x, entity.target.y - entity.initialPosition.y).length;
                    const distanceProgress = distance/initialDistance;
    
                    entitySpeed = entitySpeed * (1 + 2 * Easings.easeInOutQuart(1 - distanceProgress));
                }
    
                if (distance <= entitySpeed) {
                    distance = entitySpeed;
                }
    
                entity.position.x += entitySpeed * (entity.target.x - entity.position.x) / distance;
                entity.position.y += entitySpeed *(entity.target.y - entity.position.y) / distance;
    
                if (entity.position.x === entity.target.x && entity.position.y === entity.target.y) {
                    if (entity instanceof RobotEntity) {
                        entity.explode();
                    }
    
                    entity.target = null;
                    entity.isMoving = false;
                    entity.initialPosition = null;
                }
            }
        }
    }
}