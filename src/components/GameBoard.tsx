import { useEffect, useRef } from 'react'
import type { Board } from '../features/game/types/game'

function getTileClass(value: number): string {
  if (value === 0) return 'tile-empty'
  if (value <= 2048) return `tile-${value}`
  return 'tile-super'
}

function getTileText(value: number): string {
  return value === 0 ? '' : String(value)
}

type TileMeta = {
  row: number
  col: number
  value: number
  isNew: boolean
  isMerged: boolean
}

type GameBoardProps = {
  board: Board
}

export function GameBoard({ board }: GameBoardProps) {
  const prevBoardRef = useRef<Board>(board.map((r) => [...r]))

  const meta = new Map<string, TileMeta>()
  const prev = prevBoardRef.current

  board.forEach((row, r) => {
    row.forEach((value, c) => {
      if (value !== 0) {
        const key = `${r},${c}`
        const isNew = prev[r][c] === 0
        const isMerged = !isNew && prev[r][c] < value
        meta.set(key, { row: r, col: c, value, isNew, isMerged })
      }
    })
  })

  useEffect(() => {
    prevBoardRef.current = board.map((r) => [...r])
  }, [board])

  return (
    <div className="board-container">
      <div className="board-grid">
        {/* background cells */}
        {Array.from({ length: 16 }).map((_, i) => (
          <div key={`bg-${i}`} className="board-cell" />
        ))}
        {/* tiles */}
        {Array.from(meta.values()).map((tile) => (
          <div
            key={`tile-${tile.row}-${tile.col}-${tile.value}`}
            className={`board-tile ${getTileClass(tile.value)}`}
            style={{
              gridRow: tile.row + 1,
              gridColumn: tile.col + 1,
            }}
          >
            <div
              className={`board-tile-inner${tile.isNew ? ' is-new' : ''}${tile.isMerged ? ' is-merged' : ''}`}
            >
              {getTileText(tile.value)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
