import { useGame } from '../features/game/hooks/useGame'
import { ScoreBoard } from '../components/ScoreBoard'
import { GameBoard } from '../components/GameBoard'
import { GameOverlay } from '../components/GameOverlay'

export default function App() {
  const {
    state,
    restart,
    dismissWin,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    showWinOverlay,
    soundEnabled,
    toggleSound,
  } = useGame()

  return (
    <div className="app" role="application" aria-label="2048 游戏">
      <header className="app-header">
        <h1>2048</h1>
        <p className="app-subtitle">New Era</p>
      </header>
      <ScoreBoard
        score={state.score}
        bestScore={state.bestScore}
        onRestart={restart}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
      />
      {/* Live region for screen readers to announce score changes and game state */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        得分 {state.score}，最高分 {state.bestScore}
        {state.isOver ? '。游戏结束' : ''}
        {showWinOverlay ? '。达成 2048' : ''}
      </div>
      <div
        className="game-area"
        role="region"
        aria-label="游戏棋盘"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <GameBoard board={state.board} lastAdded={state.lastAdded} lastMerged={state.lastMerged} />
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
