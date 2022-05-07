export default class GameLoop {
  public simulationStep = 1000 / 60;
  public frameDelta = 0;
  public lastFrameTimeMs = 0;
  public fps = 60;
  public lastFpsUpdate = 0;
  public framesThisSecond = 0;
  public numUpdateSteps = 0;
  public minFrameDelay = 0;
  public running = false;
  public started = false;
  public panic = false;
  public rafHandle?: number;

  constructor () {
    this.animate = this.animate.bind(this);
  }

  public get maxAllowedFps (): number {
    return 1000 / this.minFrameDelay;
  }

  public set maxAllowedFps (fps: number) {
    if (fps == null) {
      fps = Infinity;
    }
        
    if (fps === 0) {
      this.stop();
    } else {
      this.minFrameDelay = 1000 / fps;
    }
  }

  /* eslint-disable @typescript-eslint/no-empty-function */
  public begin = (_time: number, delta: number): void => {};
  public end = (_fps: number, panic: boolean): void => {};
  public update = (_delta: number): void => {};
  public render = (_interpolation: number): void => {};
  /* eslint-enable @typescript-eslint/no-empty-function */

  public resetFrameDelta (): number {
    const frameDelta = this.frameDelta;
    this.frameDelta = 0;
    return frameDelta;
  }

  public start (): void {
    if (this.started) {
      return;
    }
        
    this.started = true;
    this.rafHandle = requestAnimationFrame((timestamp) => {
      this.render(1);
      this.running = true;
      this.lastFrameTimeMs = timestamp;
      this.lastFpsUpdate = timestamp;
      this.framesThisSecond = 0;
      this.rafHandle = requestAnimationFrame(this.animate);
    });
  }

  public stop (): void {
    this.running = false;
    this.started = false;

    if (this.rafHandle) {
      cancelAnimationFrame(this.rafHandle);
    }
  }

  public animate (time: number): void {
    this.rafHandle = requestAnimationFrame(this.animate);
    if (time < this.lastFrameTimeMs + this.minFrameDelay) {
      return;
    }

    this.frameDelta += time - this.lastFrameTimeMs;
    this.lastFrameTimeMs = time;

    this.begin(time, this.frameDelta);

    if (time > this.lastFpsUpdate + 1000) {
      this.fps = 0.25 * this.framesThisSecond + 0.75 * this.fps;
      this.lastFpsUpdate = time;
      this.framesThisSecond = 0;
    }
    ++this.framesThisSecond;

    this.numUpdateSteps = 0;
    while (this.frameDelta >= this.simulationStep) {
      this.update(this.simulationStep);
      this.frameDelta -= this.simulationStep;

      if (++this.numUpdateSteps >= 240) {
        this.panic = true;
        break;
      }
    }

    this.render(this.frameDelta / this.simulationStep);
    this.end(this.fps, this.panic);

    this.panic = false;
  }
}