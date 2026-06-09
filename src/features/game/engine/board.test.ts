import { describe, it, expect } from 'vitest'
import {
  createEmptyBoard,
  cloneBoard,
  getEmptyCells,
  boardsEqual,
  addRandomTile,
  initBoard,
  BOARD_SIZE,
} from './board'
import { createSeededRNG } from '../utils/random'

describe('createEmptyBoard', () => {
  it('returns a 4x4 board filled with zeros', () => {
    const board = createEmptyBoard()
    expect(board).toHaveLength(BOARD_SIZE)
    board.forEach((row) => {
      expect(row).toHaveLength(BOARD_SIZE)
      expect(row.every((v) => v === 0)).toBe(true)
    })
  })
})

describe('cloneBoard', () => {
  it('creates a deep copy', () => {
    const original = [
      [2, 0, 0, 0],
      [0, 4, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]
    const copy = cloneBoard(original)
    expect(copy).toEqual(original)
    copy[0][0] = 99
    expect(original[0][0]).toBe(2)
  })
})

describe('getEmptyCells', () => {
  it('returns all empty positions', () => {
    const board = [
      [2, 0, 0, 4],
      [0, 0, 0, 0],
      [0, 8, 0, 0],
      [0, 0, 0, 16],
    ]
    const empties = getEmptyCells(board)
    expect(empties).toHaveLength(12)
    expect(empties).toContainEqual({ row: 0, col: 1 })
    expect(empties).toContainEqual({ row: 1, col: 2 })
    expect(empties).not.toContainEqual({ row: 0, col: 0 })
  })

  it('returns empty array for full board', () => {
    const board = [
      [2, 4, 8, 16],
      [32, 64, 128, 256],
      [512, 1024, 2, 4],
      [8, 16, 32, 64],
    ]
    expect(getEmptyCells(board)).toHaveLength(0)
  })
})

describe('boardsEqual', () => {
  it('returns true for identical boards', () => {
    const a = [
      [2, 0, 4, 0],
      [0, 0, 0, 0],
      [0, 8, 0, 0],
      [0, 0, 0, 16],
    ]
    expect(boardsEqual(a, cloneBoard(a))).toBe(true)
  })

  it('returns false for different boards', () => {
    const a = createEmptyBoard()
    const b = createEmptyBoard()
    b[0][0] = 2
    expect(boardsEqual(a, b)).toBe(false)
  })
})

describe('addRandomTile', () => {
  it('adds a tile to an empty board', () => {
    const rng = createSeededRNG(42)
    const board = createEmptyBoard()
    const result = addRandomTile(board, rng)
    expect(result.added).not.toBeNull()
    const { row, col } = result.added!
    expect(result.board[row][col]).toBeGreaterThanOrEqual(2)
    expect(result.board[row][col]).toBeLessThanOrEqual(4)
  })

  it('does not modify original board', () => {
    const rng = createSeededRNG(1)
    const board = createEmptyBoard()
    addRandomTile(board, rng)
    expect(board[0][0]).toBe(0)
  })

  it('returns unchanged board when no empty cells', () => {
    const rng = createSeededRNG(1)
    const board = [
      [2, 4, 8, 16],
      [32, 64, 128, 256],
      [512, 1024, 2, 4],
      [8, 16, 32, 64],
    ]
    const result = addRandomTile(board, rng)
    expect(result.added).toBeNull()
    expect(boardsEqual(result.board, board)).toBe(true)
  })
})

describe('initBoard', () => {
  it('creates a board with exactly two non-zero tiles', () => {
    const rng = createSeededRNG(123)
    const board = initBoard(rng)
    const nonZero = board.flat().filter((v) => v !== 0)
    expect(nonZero).toHaveLength(2)
    expect(nonZero.every((v) => v === 2 || v === 4)).toBe(true)
  })
})
