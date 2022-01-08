import Util from "../core/util"; // TODO: Resolve issue for importing from base URL
import Renderer from "core/renderer";
import Easings from "../core/easings"; // TODO: Resolve issue for importing from base URL
import BitMath from "../core/bit-math"; // TODO: Resolve issue for importing from base URL
import TradeableInterface from "interfaces/tradeable-interface";
import Vector from "../core/vector";
import Tile from "./tile";
import EmptyTile from "./empty-tile";

export default class WheatTile extends Tile implements TradeableInterface {
    public readonly buyPrice: number = 0;
    public readonly sellPrice: number = 0;

    public readonly GROWTH_TIME = 7.5 * 1000;
    public readonly MIN_SEED_DROP = 0;
    public readonly MAX_SEED_DROP = 3;
    private readonly COLOR_GROWN = "#7dbf21";

    public name: string = "Wheat";

    public get growthState (): number {
      const growth = (Date.now() - this.timeCreated) / this.GROWTH_TIME * (1 - this.damage);
      return growth > 1 ? 1 : growth;
    }

    public get textColor (): string | null {
      return "#ffffff";
    }

    public get backgroundColor (): string | null {
      const mixAmount = Easings.easeInCubic(this.growthState);
      const growthColor = Util.mixColors(EmptyTile.COLOR, this.COLOR_GROWN, mixAmount);
      return this.getDamagedHexColor(growthColor);
    }

    public getChar (preview: boolean = false): string | null {
      if (preview || this.growthState < 0.4) {
        return "🌱";
      }

      if (this.growthState >= 1) {
        return "🌾";
      }

      return "🌿";
    }

    public onClicked (): void {
      // TODO: Implement logic
    }

    public dropSeeds (): number {
      return BitMath.floor(Math.random() * (this.MAX_SEED_DROP - this.MIN_SEED_DROP + 1)) + this.MIN_SEED_DROP;
    }

    public render (renderer: Renderer, params: {
      ctx: CanvasRenderingContext2D;
      worldPosition: Vector;
      isHovered?: boolean;
      opacity?: number | null;
    }): void {
      super.render(renderer, params);
    }

    public renderLatest (renderer: Renderer, params: {
      ctx: CanvasRenderingContext2D;
      worldPosition: Vector;
      isHovered?: boolean;
    }): void {
      super.renderLatest(renderer, params);

      // Is hovered and has not fully grown yet
      if (params.isHovered && this.growthState < 1) {
        // Calculate world position for progress bar
        const growthProgressWorldPos = new Vector(
          params.worldPosition.x + 0.25 / 2,
          params.worldPosition.y + 0.7
        );
        
        renderer.paintProgressBar(params.ctx, {
          worldPosition: growthProgressWorldPos,
          progress: this.growthState
        });
      }
    }
}