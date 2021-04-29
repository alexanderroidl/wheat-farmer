import GameLoop from "./game-loop";
import Browser from "./browser";
import World from "./world";

export default class Game {
    private static _instance: Game;

    loop: GameLoop = new GameLoop();
    world: World = new World();
    browser: Browser = new Browser(this.world);

    public static get instance () {
        if (!Game._instance) {
            Game._instance = new Game();
        }
    
        return Game._instance;
    }

    constructor () {
        this.setupLoop();
    }

    setupLoop () {
        this.loop.fps = 1;
        this.loop.simulationStep = 1000 / 1;
        //this.loop.update = (delta: number) => {};
        this.loop.update = (delta: number) => {
            this.browser.render();
        };

        this.loop.start();
    }
}