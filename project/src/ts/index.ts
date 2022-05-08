import Graphics from "@graphics/graphics";
import { Browser } from "@base/browser/browser";
import Game from "./game";

const graphics = new Graphics(() => {
  new Game(graphics);
});

if (Browser.isMobile) {
  Browser.alert("Warning: This is an early-alpha build of the game, mobile is not yet supported.");
}