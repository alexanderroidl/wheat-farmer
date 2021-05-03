import EmptyTile from '../tiles/empty';
import WheatTile from '../tiles/wheat';
import Player from "./player";
import EntityInterface from '../interfaces/entity-interface';
import RobotEntity from '../entities/enemies/robot';
import Vector from '../core/vector';
import Easings from "../core/easings";
import Tile from 'tiles/tile';

export default class World {
    public readonly SIZE: number = 12; // 20x20 world size

    private _tiles: Tile[][];
    private _createdAt: number = Date.now();
    private _player: Player = new Player();
    private _entities: EntityInterface[] = [];

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

    constructor () {
        this._tiles = Array(this.SIZE).fill([]).map(() => {
            const emptyTile = new EmptyTile();
            return Array(this.SIZE).fill(emptyTile);
        });

        setTimeout(() => {
            const robot = new RobotEntity(-2, -2);
            robot.target = new Vector(this.SIZE/2, this.SIZE/2);
            this._entities.push(robot);
        }, 5 * 1000);
    }

    public isValidTilePos (x: number, y: number): boolean {
        return this._tiles[y] != null && this._tiles[y][x] != null;
    }

    public onTileClicked (pos: Vector): void {
        if (!this.isValidTilePos(pos.x, pos.y)) {
            return;
        }

        const tile = this._tiles[pos.y][pos.x];
        tile.onClicked();

        if (tile instanceof EmptyTile) {
            if (this._player.items.poppySeeds > 0) {
                this._player.items.poppySeeds--;

                this._tiles[pos.y][pos.x] = new WheatTile();
            }
        }

        if (tile instanceof WheatTile) {
            if (tile.growthState >= 1) {
                const seedDrops = tile.dropSeeds();
                
                this._player.items.poppySeeds += seedDrops;
                this._player.items.opium += 1;

                this._tiles[pos.y][pos.x] = new EmptyTile();
            }
        }
    }

    public getSurroundingTileCoords (x: number, y: number, includeSelf: boolean = false): Vector[] {
        const tiles: Vector[] = [];

        if (this._tiles[y]) {
            if (this._tiles[y][x - 1]) {
                tiles.push(new Vector(x - 1, y));
            }
    
            if (this._tiles[y][x + 1]) {
                tiles.push(new Vector(x + 1, y));
            }
        }

        if (this._tiles[y - 1]) {
            if (this._tiles[y - 1][x - 1]) {
                tiles.push(new Vector(x - 1, y - 1));
            }
    
            if (this._tiles[y - 1][x]) {
                tiles.push(new Vector(x, y - 1));
            }

            if (this._tiles[y - 1][x + 1]) {
                tiles.push(new Vector(x + 1, y - 1));
            }
        }

        if (this._tiles[y + 1]) {
            if (this._tiles[y + 1][x - 1]) {
                tiles.push(new Vector(x - 1, y + 1));
            }
    
            if (this._tiles[y + 1][x]) {
                tiles.push(new Vector(x, y + 1));
            }

            if (this._tiles[y + 1][x + 1]) {
                tiles.push(new Vector(x + 1, y + 1));
            }
        }

        if (includeSelf && this._tiles[y][x]) {
            tiles.push(new Vector(x, y));
        }

        return tiles;
    }

    public update (delta: number): void {
        for (const entity of this.entities) {
            if (entity instanceof RobotEntity) {
                if (entity.hasExploded) {
                    this._entities = this._entities.filter((v) => v != entity);

                    const surroundingTileCoords = this.getSurroundingTileCoords(Math.floor(entity.position.x), Math.floor(entity.position.y), true);

                    for (const surroundingTilePos of surroundingTileCoords) {
                        const surroundingTile = this._tiles[surroundingTilePos.y][surroundingTilePos.x];

                        if (!(surroundingTile instanceof EmptyTile)) {
                            this._tiles[surroundingTilePos.y][surroundingTilePos.x] = new EmptyTile();
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