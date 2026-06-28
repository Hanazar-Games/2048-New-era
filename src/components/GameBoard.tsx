import { useEffect, useId } from 'react'
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

const previousBoards = new Map<string, Board>()

function getTileMeta(board: Board, prev: Board): TileMeta[] {
  const meta: TileMeta[] = []
  board.forEach((row, r) => {
    row.forEach((value, c) => {
      if (value !== 0) {
        const isNew = prev[r][c] === 0
        const isMerged = !isNew && prev[r][c] < value
        meta.push({ row: r, col: c, value, isNew, isMerged })
      }
    })
  })

  return meta
}

export function GameBoard({ board }: GameBoardProps) {
  const boardId = useId()
  const tiles = getTileMeta(board, previousBoards.get(boardId) ?? board)

  useEffect(() => {
    previousBoards.set(
      boardId,
      board.map((r) => [...r])
    )

    return () => {
      previousBoards.delete(boardId)
    }
  }, [board, boardId])

  return (
    <div className="board-container">
      <div className="board-grid">
        {/* background cells */}
        {Array.from({ length: 16 }).map((_, i) => (
          <div key={`bg-${i}`} className="board-cell" />
        ))}
        {/* tiles */}
        {tiles.map((tile) => (
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
