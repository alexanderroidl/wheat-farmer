import Vector from "@core/vector";

export default class Sound {
  public static all: Sound[] = [];

  public static mainMusic = new Sound("audio/210107blunt164.ogg", true);

  public position: Vector | null = null;
  private _isMusic: boolean = false;
  private _audio: HTMLAudioElement;

  /**
   * Constructor
   *
   * @param src - Source path for audio file
   * @param isMusic - Indicates whether sound is music
   */
  constructor (src: string, isMusic: boolean = false) {
    this._audio = new Audio(src);
    this.isMusic = isMusic;

    Sound.all.push(this);
  }

  public get volume (): number {
    return this._audio.volume;
  }

  public get paused (): boolean {
    return this._audio.paused;
  }

  public get isMusic (): boolean {
    return this._isMusic;
  }

  public set volume (volume: number) {
    this._audio.volume = volume;
  }

  public set isMusic (isMusic: boolean) {
    this._isMusic = !!isMusic;
    this._audio.loop = !!isMusic;
  }

  /**
   * Unlock all sounds to be played anytime by browser
   */
  public static unlockAll (): void {
    for (const sound of Sound.all) {
      sound.unlock();
    }
  }

  /**
   * Start/resume playback
   */
  public play (): void {
    this._audio.play();
  }

  /**
   * Pause playback
   */
  public pause (): void {
    this._audio.pause();
  }

  /**
   * Unlock to be played anytime by browser
   */
  public unlock (): void {
    this.play();
    this.pause();
    this._audio.currentTime = 0;
  }
}