import { Texture } from "pixi.js";
import Graphics from "./graphics";

class TextureSources {
  public static readonly empty: string = "empty 0";
  public static readonly notFound: string = "notfound 0";
  public static readonly background: string = "bg 0";
  public static readonly wheat: string[] = [
    "wheat 0",
    "wheat 1",
    "wheat 2",
    "wheat 3",
    "wheat 4",
    "wheat 5",
    "wheat 6",
    "wheat 7",
    "wheat 8",
    "wheat 9",
    "wheat 10"
  ];
  public static readonly palmTree: string[] = [
    "palmtree 0",
    "palmtree 1"
  ];
  public static readonly explosion: string[] = [
    "explosion 0",
    "explosion 1",
    "explosion 2"
  ];
  public static readonly robot: {
    red: string[];
    yellow: string[];
    green: string[];
    hawaii: string[];
  } = {
      red: [
        "robot red 0",
        "robot red 1",
        "robot red 2",
        "robot red 3"
      ],
      yellow: [
        "robot yellow 0",
        "robot yellow 1",
        "robot yellow 2",
        "robot yellow 3"
      ],
      green: [
        "robot green 0",
        "robot green 1",
        "robot green 2",
        "robot green 3"
      ],
      hawaii: [
        "robot hawaii 0",
        "robot hawaii 1",
        "robot hawaii 2",
        "robot hawaii 3"
      ]
    };
  public static readonly bomb: string[] = [
    "bomb 0",
    "bomb 1",
    "bomb 2",
    "bomb 3"
  ];
  public static readonly hats: string[] = [
    "robot extras 1"
  ];
  public static readonly damage: string[] = [
    "damage 0",
    "damage 1",
    "damage 2",
    "damage 3"
  ];
}

export interface RobotTextureGroups {
  red: Texture[];
  yellow: Texture[];
  green: Texture[];
  hawaii: Texture[];
}

export class Textures {
  private static _instance?: Textures;

  empty: Texture;
  notFound: Texture;
  background: Texture;
  wheat: Texture[];
  palmTree: Texture[];
  explosion: Texture[];
  robot: RobotTextureGroups;
  bomb: Texture[];
  hats: Texture[];
  damage: Texture[];

  constructor () {
    this.empty = Graphics.getTexture(TextureSources.empty);
    this.notFound = Graphics.getTexture(TextureSources.notFound);
    this.background = Graphics.getTexture(TextureSources.background);
    this.wheat = Graphics.getTextures(TextureSources.wheat);
    this.palmTree = Graphics.getTextures(TextureSources.palmTree);
    this.explosion = Graphics.getTextures(TextureSources.explosion);
    this.robot = {
      red: Graphics.getTextures(TextureSources.robot.red),
      yellow: Graphics.getTextures(TextureSources.robot.yellow),
      green: Graphics.getTextures(TextureSources.robot.green),
      hawaii: Graphics.getTextures(TextureSources.robot.hawaii)
    };
    this.bomb = Graphics.getTextures(TextureSources.bomb);
    this.hats = Graphics.getTextures(TextureSources.hats);
    this.damage = Graphics.getTextures(TextureSources.damage);
  }

  public static get empty (): Texture {
    return Textures.instance.empty;
  }

  public static get notFound (): Texture {
    return Textures.instance.notFound;
  }

  public static get background (): Texture {
    return Textures.instance.background;
  }

  public static get wheat (): Texture[] {
    return Textures.instance.wheat;
  }

  public static get palmTree (): Texture[] {
    return Textures.instance.palmTree;
  }

  public static get explosion (): Texture[] {
    return Textures.instance.explosion;
  }

  public static get robot (): RobotTextureGroups {
    return Textures.instance.robot;
  }

  public static get bomb (): Texture[] {
    return Textures.instance.bomb;
  }

  public static get hats (): Texture[] {
    return Textures.instance.hats;
  }

  public static get damage (): Texture[] {
    return Textures.instance.damage;
  }

  public static get instance (): Textures {
    if (!Textures._instance) {
      Textures._instance = new Textures();
    }
    return Textures._instance;
  }
}