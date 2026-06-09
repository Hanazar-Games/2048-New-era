import { describe, it, expect } from 'vitest'
import { moveBoard, canMoveInDirection } from './move'
import type { Board } from '../types/game'

describe('moveBoard / left', () => {
  it('merges adjacent equal values', () => {
    const board: Board = [
      [2, 2, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]
    const result = moveBoard(board, 'left')
    expect(result.board[0]).toEqual([4, 0, 0, 0])
    expect(result.scoreGained).toBe(4)
    expect(result.moved).toBe(true)
  })

  it('compresses empty cells before merging', () => {
    const board: Board = [
      [2, 0, 2, 4],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]
    const result = moveBoard(board, 'left')
    expect(result.board[0]).toEqual([4, 4, 0, 0])
    expect(result.scoreGained).toBe(4)
    expect(result.moved).toBe(true)
  })

  /**
   * 核心规则：同一轮只合并一次。
   * [2,2,2,2] 向左应变为 [4,4,0,0]，而不是 [8,0,0,0]
   */
  it('merges each value at most once per move (the cardinal rule)', () => {
    const board: Board = [
      [2, 2, 2, 2],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]
    const result = moveBoard(board, 'left')
    expect(result.board[0]).toEqual([4, 4, 0, 0])
    expect(result.scoreGained).toBe(8)
    expect(result.moved).toBe(true)
  })

  it('does not chain-merge newly created tiles', () => {
    const board: Board = [
      [4, 0, 4, 4],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]
    const result = moveBoard(board, 'left')
    // 4+4=8, 后面还有一个 4 跟着
    expect(result.board[0]).toEqual([8, 4, 0, 0])
    expect(result.scoreGained).toBe(8)
  })

  it('does nothing when no move possible', () => {
    const board: Board = [
      [2, 4, 8, 16],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]
    const result = moveBoard(board, 'left')
    expect(result.board[0]).toEqual([2, 4, 8, 16])
    expect(result.scoreGained).toBe(0)
    expect(result.moved).toBe(false)
  })

  it('only compresses without merge when values differ', () => {
    const board: Board = [
      [0, 2, 0, 4],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]
    const result = moveBoard(board, 'left')
    expect(result.board[0]).toEqual([2, 4, 0, 0])
    expect(result.scoreGained).toBe(0)
    expect(result.moved).toBe(true)
  })
})

describe('moveBoard / right', () => {
  it('mirrors left behavior', () => {
    const board: Board = [
      [2, 2, 2, 2],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]
    const result = moveBoard(board, 'right')
    expect(result.board[0]).toEqual([0, 0, 4, 4])
    expect(result.scoreGained).toBe(8)
  })
})

describe('moveBoard / up', () => {
  it('compresses and merges columns upward', () => {
    const board: Board = [
      [2, 0, 0, 0],
      [2, 0, 0, 0],
      [2, 0, 0, 0],
      [2, 0, 0, 0],
    ]
    const result = moveBoard(board, 'up')
    expect(result.board[0][0]).toBe(4)
    expect(result.board[1][0]).toBe(4)
    expect(result.board[2][0]).toBe(0)
    expect(result.board[3][0]).toBe(0)
    expect(result.scoreGained).toBe(8)
  })
})

describe('moveBoard / down', () => {
  it('compresses and merges columns downward', () => {
    const board: Board = [
      [2, 0, 0, 0],
      [2, 0, 0, 0],
      [2, 0, 0, 0],
      [2, 0, 0, 0],
    ]
    const result = moveBoard(board, 'down')
    expect(result.board[2][0]).toBe(4)
    expect(result.board[3][0]).toBe(4)
    expect(result.board[0][0]).toBe(0)
    expect(result.board[1][0]).toBe(0)
    expect(result.scoreGained).toBe(8)
  })
})

describe('moveBoard / score accumulation', () => {
  it('sums scores from all rows', () => {
    const board: Board = [
      [2, 2, 0, 0],
      [4, 4, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]
    const result = moveBoard(board, 'left')
    expect(result.scoreGained).toBe(4 + 8)
  })
})

describe('canMoveInDirection', () => {
  it('returns true when move changes board', () => {
    const board: Board = [
      [0, 2, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]
    expect(canMoveInDirection(board, 'left')).toBe(true)
    expect(canMoveInDirection(board, 'right')).toBe(true)
  })

  it('returns false when board cannot move in that direction', () => {
    const board: Board = [
      [2, 4, 8, 16],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]
    expect(canMoveInDirection(board, 'left')).toBe(false)
    expect(canMoveInDirection(board, 'up')).toBe(false)
  })
})
