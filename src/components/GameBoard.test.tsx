import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GameBoard } from './GameBoard'
import type { Board } from '../features/game/types/game'

describe('GameBoard', () => {
  it('renders background cells', () => {
    const board: Board = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]
    render(<GameBoard board={board} />)
    const cells = screen.getAllByText('', { selector: '.board-cell' })
    expect(cells).toHaveLength(16)
  })

  it('renders tiles for non-zero values', () => {
    const board: Board = [
      [2, 4, 0, 0],
      [0, 8, 16, 0],
      [0, 0, 32, 64],
      [0, 0, 0, 128],
    ]
    render(<GameBoard board={board} />)
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('4')).toBeInTheDocument()
    expect(screen.getByText('8')).toBeInTheDocument()
    expect(screen.getByText('16')).toBeInTheDocument()
    expect(screen.getByText('32')).toBeInTheDocument()
    expect(screen.getByText('64')).toBeInTheDocument()
    expect(screen.getByText('128')).toBeInTheDocument()
  })

  it('applies correct tile color classes', () => {
    const board: Board = [
      [2, 4, 8, 16],
      [32, 64, 128, 256],
      [512, 1024, 2048, 0],
      [0, 0, 0, 0],
    ]
    const { container } = render(<GameBoard board={board} />)
    expect(container.querySelector('.tile-2')).toBeInTheDocument()
    expect(container.querySelector('.tile-4')).toBeInTheDocument()
    expect(container.querySelector('.tile-8')).toBeInTheDocument()
    expect(container.querySelector('.tile-16')).toBeInTheDocument()
    expect(container.querySelector('.tile-32')).toBeInTheDocument()
    expect(container.querySelector('.tile-64')).toBeInTheDocument()
    expect(container.querySelector('.tile-128')).toBeInTheDocument()
    expect(container.querySelector('.tile-256')).toBeInTheDocument()
    expect(container.querySelector('.tile-512')).toBeInTheDocument()
    expect(container.querySelector('.tile-1024')).toBeInTheDocument()
    expect(container.querySelector('.tile-2048')).toBeInTheDocument()
  })

  it('does not render tiles for zero values', () => {
    const board: Board = [
      [2, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]
    render(<GameBoard board={board} />)
    const tiles = screen.queryAllByText('0')
    expect(tiles).toHaveLength(0)
  })

  it('applies is-new animation class to newly appeared tiles after board change', () => {
    const emptyBoard: Board = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]
    const boardWithTile: Board = [
      [2, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]
    const { container, rerender } = render(<GameBoard board={emptyBoard} />)

    // Empty board has no tiles
    expect(container.querySelector('.board-tile')).not.toBeInTheDocument()

    // Re-render with a tile — it should have is-new
    rerender(<GameBoard board={boardWithTile} />)
    expect(container.querySelector('.is-new')).toBeInTheDocument()

    // Re-render with same board — no new tiles
    rerender(<GameBoard board={boardWithTile} />)
    expect(container.querySelector('.is-new')).not.toBeInTheDocument()
  })

  it('uses engine metadata to distinguish merged tiles from newly added tiles', () => {
    const board: Board = [
      [4, 0, 0, 2],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]

    render(
      <GameBoard board={board} lastMerged={[{ row: 0, col: 0 }]} lastAdded={{ row: 0, col: 3 }} />
    )

    expect(screen.getByText('4')).toHaveClass('is-merged')
    expect(screen.getByText('4')).not.toHaveClass('is-new')
    expect(screen.getByText('2')).toHaveClass('is-new')
    expect(screen.getByText('2')).not.toHaveClass('is-merged')
  })
})
