const BEST_SCORE_KEY = '2048-best-score'
const SOUND_ENABLED_KEY = '2048-sound-enabled'

export function loadBestScore(): number {
  try {
    const raw = localStorage.getItem(BEST_SCORE_KEY)
    if (raw === null) return 0
    const n = Number(raw)
    return Number.isFinite(n) && n >= 0 ? n : 0
  } catch {
    return 0
  }
}

export function saveBestScore(score: number): void {
  try {
    localStorage.setItem(BEST_SCORE_KEY, String(score))
  } catch {
    // ignore storage errors (e.g. private mode)
  }
}

export function loadSoundEnabled(): boolean {
  try {
    const raw = localStorage.getItem(SOUND_ENABLED_KEY)
    return raw === 'true'
  } catch {
    return false
  }
}

export function saveSoundEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(SOUND_ENABLED_KEY, String(enabled))
  } catch {
    // ignore storage errors (e.g. private mode)
  }
}
