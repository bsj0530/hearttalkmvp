// src/lib/sound.ts
import correctMp3 from "@/assets/sounds/correct.mp3";
import wrongMp3 from "@/assets/sounds/wrong.mp3";
import winnerMp3 from "@/assets/sounds/winner.mp3";
import backgroundMp3 from "@/assets/sounds/background.mp3";

class SoundManager {
  private bgm: HTMLAudioElement | null = null;
  private unlocked = false;

  sfxVolume = 0.9;
  bgmVolume = 0.05;

  // ✅ 첫 클릭에서 호출하면 모바일/크롬 정책 대응이 안정적
  unlock() {
    if (this.unlocked) return;

    try {
      const a = new Audio();
      a.volume = 0;
      // 일부 브라우저는 play() 호출 자체가 unlock에 도움됨
      a.play().catch(() => {});
    } catch {
      // noop
    }

    this.unlocked = true;

    // (선택) 미리 로드
    this.preload();
  }

  preload() {
    try {
      // SFX는 재생할 때마다 새 Audio를 만들 거라 preload는 optional
      // BGM만 확실히 생성해둠
      if (!this.bgm) {
        this.bgm = new Audio(backgroundMp3);
        this.bgm.loop = true;
        this.bgm.volume = this.bgmVolume;
        this.bgm.preload = "auto";
      }
    } catch {
      // noop
    }
  }

  private playOneShot(src: string, volume = this.sfxVolume) {
    try {
      const a = new Audio(src);
      a.volume = volume;
      a.currentTime = 0;
      a.play().catch(() => {});
    } catch {
      // noop
    }
  }

  playCorrect() {
    this.playOneShot(correctMp3, this.sfxVolume);
  }

  playWrong() {
    this.playOneShot(wrongMp3, this.sfxVolume);
  }

  playWinner() {
    this.playOneShot(winnerMp3, 1.0);
  }

  startBgm() {
    if (!this.bgm) {
      this.bgm = new Audio(backgroundMp3);
      this.bgm.loop = true;
      this.bgm.volume = this.bgmVolume;
      this.bgm.preload = "auto";
    }

    // 이미 재생 중이면 유지
    if (!this.bgm.paused) return;

    // 원하면 이어서 재생하고 싶을 수도 있지만,
    // 요청이 "게임 시작하면"이니 처음부터 재생
    this.bgm.currentTime = 0;
    this.bgm.play().catch(() => {});
  }

  stopBgm() {
    if (!this.bgm) return;
    this.bgm.pause();
    this.bgm.currentTime = 0;
  }

  setBgmVolume(v: number) {
    this.bgmVolume = Math.max(0, Math.min(1, v));
    if (this.bgm) this.bgm.volume = this.bgmVolume;
  }

  setSfxVolume(v: number) {
    this.sfxVolume = Math.max(0, Math.min(1, v));
  }
}

export const sound = new SoundManager();
