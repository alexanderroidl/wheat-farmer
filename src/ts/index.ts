import Game from "./base/game";
import Browser from "./base/browser";

Game.instance;

if (Browser.isMobile()) {
    Browser.alert('Warning: This is an early-alpha build of the game, mobile is not yet supported.');
}