type GameOverlayProps = {
  showWin: boolean
  showGameOver: boolean
  onRestart: () => void
  onContinue: () => void
}

export function GameOverlay({ showWin, showGameOver, onRestart, onContinue }: GameOverlayProps) {
  if (!showWin && !showGameOver) return null

  return (
    <div
      className="game-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={showGameOver ? '游戏结束' : '胜利'}
    >
      <div className="game-overlay-content">
        <h2 className="game-overlay-title">{showGameOver ? '游戏结束' : '你赢了！'}</h2>
        <p className="game-overlay-msg">
          {showGameOver ? '没有可移动的格子了' : '达成了 2048，继续挑战更高分吧！'}
        </p>
        {showGameOver ? (
          <button
            type="button"
            className="restart-btn overlay-btn"
            onClick={onRestart}
            aria-label="再试一次"
          >
            再试一次
          </button>
        ) : (
          <button
            type="button"
            className="restart-btn overlay-btn"
            onClick={onContinue}
            aria-label="继续游戏"
          >
            继续游戏
          </button>
        )}
      </div>
    </div>
  )
}
