import { useGame } from '../features/game/hooks/useGame'
import { ScoreBoard } from '../components/ScoreBoard'
import { GameBoard } from '../components/GameBoard'
import { GameOverlay } from '../components/GameOverlay'

export default function App() {
  const { state, restart, dismissWin, onTouchStart, onTouchMove, onTouchEnd, showWinOverlay } =
    useGame()

  return (
    <div className="app">
      <header className="app-header">
        <h1>2048</h1>
        <p className="app-subtitle">New Era</p>
      </header>
      <ScoreBoard score={state.score} bestScore={state.bestScore} onRestart={restart} />
      <div
        className="game-area"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <GameBoard board={state.board} />
        <GameOverlay
          showWin={showWinOverlay}
          showGameOver={state.isOver}
          onRestart={restart}
          onContinue={dismissWin}
        />
      </div>
      <footer className="app-footer">
        <p>
          <strong>玩法：</strong>使用方向键或 WASD 移动，移动端可滑动。相同数字相遇会合并。
        </p>
      </footer>
    </div>
  )
}
