import { useEffect, useRef, useState } from 'react'

type ScoreBoardProps = {
  score: number
  bestScore: number
  onRestart: () => void
  soundEnabled: boolean
  onToggleSound: () => void
}

export function ScoreBoard({
  score,
  bestScore,
  onRestart,
  soundEnabled,
  onToggleSound,
}: ScoreBoardProps) {
  const [bump, setBump] = useState(false)
  const prevScoreRef = useRef(score)

  useEffect(() => {
    const increased = score > prevScoreRef.current
    prevScoreRef.current = score
    if (increased) {
      setBump(true)
      const timer = setTimeout(() => setBump(false), 200)
      return () => clearTimeout(timer)
    }
    // Ensure bump class is cleared when score drops (e.g., restart)
    setBump(false)
  }, [score])

  return (
    <div className="score-board">
      <div className="score-boxes">
        <div className="score-box">
          <span className="score-label">得分</span>
          <span className={`score-value ${bump ? 'is-bump' : ''}`} key={score}>
            {score}
          </span>
        </div>
        <div className="score-box">
          <span className="score-label">最高分</span>
          <span className="score-value">{bestScore}</span>
        </div>
      </div>
      <div className="score-actions">
        <button type="button" className="restart-btn" onClick={onRestart} aria-label="重新开始游戏">
          重新开始
        </button>
        <button
          type="button"
          className={`sound-btn ${soundEnabled ? 'is-on' : ''}`}
          onClick={onToggleSound}
          aria-pressed={soundEnabled}
          aria-label={soundEnabled ? '关闭音效' : '开启音效'}
          title={soundEnabled ? '关闭音效' : '开启音效'}
        >
          <span aria-hidden="true">{soundEnabled ? '♪' : '×'}</span>
          <span>音效</span>
        </button>
      </div>
    </div>
  )
}
