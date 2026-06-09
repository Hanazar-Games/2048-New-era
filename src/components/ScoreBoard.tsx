import { useEffect, useRef, useState } from 'react'

type ScoreBoardProps = {
  score: number
  bestScore: number
  onRestart: () => void
}

export function ScoreBoard({ score, bestScore, onRestart }: ScoreBoardProps) {
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
          <span className={`score-value ${bump ? 'is-bump' : ''}`} key={score}>{score}</span>
        </div>
        <div className="score-box">
          <span className="score-label">最高分</span>
          <span className="score-value">{bestScore}</span>
        </div>
      </div>
      <button type="button" className="restart-btn" onClick={onRestart}>
        重新开始
      </button>
    </div>
  )
}
