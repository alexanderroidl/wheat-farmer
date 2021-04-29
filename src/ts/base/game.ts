import GameLoop from "./game-loop";
import Browser from "./browser";
import World from "./world";

export default class Game {
    loop: GameLoop = new GameLoop();
    browser: Browser = new Browser();
    world: World = new World();

    constructor () {
        this.setupLoop();
        
        console.log("Created world", this.world.tiles);
    }

    setupLoop () {
        this.loop.fps = 1;
        this.loop.simulationStep = 1000 / 1;
        this.loop.update = (delta: number) => {};
        this.loop.update = (delta: number) => {
            this.browser.render(this.world);
        };

        this.loop.start();
    }
}