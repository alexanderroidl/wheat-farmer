class GameLoop {
    simulationStep = 1000 / 60;
    frameDelta = 0;
    lastFrameTimeMs = 0;
    fps = 60;
    lastFpsUpdate = 0;
    framesThisSecond = 0;
    numUpdateSteps = 0;
    minFrameDelay = 0;
    running = false;
    started = false;
    panic = false;
    rafHandle?: number;

    begin = (time: number, delta: number) => {};
    end = (fps: number, panic: boolean) => {};
    update = (delta: number) => {};
    render = (interpolation: number) => {};

    constructor() {
        this.animate = this.animate.bind(this);
    }

    get maxAllowedFps() {
        return 1000 / this.minFrameDelay;
    }

    set maxAllowedFps(fps) {
        if (fps == null) {
            fps = Infinity;
        }
        if (fps === 0) {
            this.stop();
        } else {
            this.minFrameDelay = 1000 / fps;
        }
    }

    resetFrameDelta() {
        const frameDelta = this.frameDelta;
        this.frameDelta = 0;
        return frameDelta;
    }

    start() {
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
        })
    }

    stop() {
        this.running = false;
        this.started = false;
        if (this.rafHandle) {
            cancelAnimationFrame(this.rafHandle);
        }
    }

    animate(time: number) {
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

export default GameLoop;