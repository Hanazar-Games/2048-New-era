const BEST_SCORE_KEY = '2048-best-score'

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
