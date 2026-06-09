import { describe, it, expect } from 'vitest'
import type { Board } from '../types/game'
import { moveBoard, canMoveInDirection } from './move'
import { addRandomTile, boardsEqual, getEmptyCells } from './board'
import { canMoveAny, moveGameState, createGameState } from './game'
import { createSeededRNG } from '../utils/random'

describe('核心规则边界验证', () => {
  it('[2,2,4,4] 向左合并得分正确', () => {
    const board: Board = [
      [2, 2, 4, 4],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]
    const result = moveBoard(board, 'left')
    expect(result.board[0]).toEqual([4, 8, 0, 0])
    expect(result.scoreGained).toBe(12) // 4 + 8
  })

  it('[2,0,2,2] 向左：先压缩再合并，最右侧 2 保留', () => {
    const board: Board = [
      [2, 0, 2, 2],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]
    const result = moveBoard(board, 'left')
    expect(result.board[0]).toEqual([4, 2, 0, 0])
    expect(result.scoreGained).toBe(4)
  })

  it('[2,2,0,2] 向左：前两个合并，第三个保留', () => {
    const board: Board = [
      [2, 2, 0, 2],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]
    const result = moveBoard(board, 'left')
    expect(result.board[0]).toEqual([4, 2, 0, 0])
    expect(result.scoreGained).toBe(4)
  })

  it('[0,2,2,2] 向右：最右侧两个先合并', () => {
    const board: Board = [
      [0, 2, 2, 2],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]
    const result = moveBoard(board, 'right')
    expect(result.board[0]).toEqual([0, 0, 2, 4])
    expect(result.scoreGained).toBe(4)
  })

  it('[1024,1024,512,256] 向左：大数合并正确', () => {
    const board: Board = [
      [1024, 1024, 512, 256],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]
    const result = moveBoard(board, 'left')
    expect(result.board[0]).toEqual([2048, 512, 256, 0])
    expect(result.scoreGained).toBe(2048)
  })

  it('空行移动不产生变化与得分', () => {
    const board: Board = [
      [0, 0, 0, 0],
      [2, 4, 8, 16],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]
    const result = moveBoard(board, 'left')
    expect(result.board[0]).toEqual([0, 0, 0, 0])
    expect(result.scoreGained).toBe(0)
    expect(result.moved).toBe(false)
  })
})

describe('四方向一致性', () => {
  it('贴边单块在非滑动方向上不动，在反方向上可动', () => {
    const board: Board = [
      [2, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]
    expect(moveBoard(board, 'left').moved).toBe(false)
    expect(moveBoard(board, 'up').moved).toBe(false)
    expect(moveBoard(board, 'right').moved).toBe(true)
    expect(moveBoard(board, 'down').moved).toBe(true)
  })

  it('单列三个 2 向下：最下方两个合并，滑到底部', () => {
    const board: Board = [
      [0, 0, 0, 0],
      [2, 0, 0, 0],
      [2, 0, 0, 0],
      [2, 0, 0, 0],
    ]
    const result = moveBoard(board, 'down')
    expect(result.board[0][0]).toBe(0)
    expect(result.board[1][0]).toBe(0)
    expect(result.board[2][0]).toBe(2)
    expect(result.board[3][0]).toBe(4)
    expect(result.scoreGained).toBe(4)
  })

  it('单行三个 2 向右：最右侧两个合并，压到最右', () => {
    const board: Board = [
      [2, 2, 2, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]
    const result = moveBoard(board, 'right')
    expect(result.board[0]).toEqual([0, 0, 2, 4])
    expect(result.scoreGained).toBe(4)
  })
})

describe('canMoveAny 与四方向一致性', () => {
  it('canMoveAny 为 false 时，四方向 canMoveInDirection 均为 false', () => {
    const dead: Board = [
      [2, 4, 2, 4],
      [4, 2, 4, 2],
      [2, 4, 2, 4],
      [4, 2, 4, 2],
    ]
    expect(canMoveAny(dead)).toBe(false)
    expect(canMoveInDirection(dead, 'left')).toBe(false)
    expect(canMoveInDirection(dead, 'right')).toBe(false)
    expect(canMoveInDirection(dead, 'up')).toBe(false)
    expect(canMoveInDirection(dead, 'down')).toBe(false)
  })

  it('canMoveAny 为 true 时，至少有一个方向 canMoveInDirection 为 true', () => {
    const boards: Board[] = [
      [
        [2, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
      [
        [2, 2, 4, 8],
        [4, 8, 16, 2],
        [8, 16, 2, 4],
        [16, 2, 4, 8],
      ],
      [
        [2, 4, 8, 16],
        [2, 8, 16, 2],
        [8, 16, 2, 4],
        [16, 2, 4, 8],
      ],
    ]
    for (const b of boards) {
      const any = canMoveAny(b)
      const left = canMoveInDirection(b, 'left')
      const right = canMoveInDirection(b, 'right')
      const up = canMoveInDirection(b, 'up')
      const down = canMoveInDirection(b, 'down')
      expect(any).toBe(left || right || up || down)
    }
  })
})

describe('满盘移动', () => {
  it('满盘且有横向可合并：left 正确合并', () => {
    const board: Board = [
      [2, 2, 4, 8],
      [4, 8, 16, 2],
      [8, 16, 2, 4],
      [16, 2, 4, 8],
    ]
    const result = moveBoard(board, 'left')
    expect(result.moved).toBe(true)
    expect(result.board[0]).toEqual([4, 4, 8, 0])
    expect(result.scoreGained).toBe(4)
  })

  it('满盘且有纵向可合并：up 正确合并', () => {
    const board: Board = [
      [2, 4, 8, 16],
      [2, 8, 16, 2],
      [8, 16, 2, 4],
      [16, 2, 4, 8],
    ]
    const result = moveBoard(board, 'up')
    expect(result.moved).toBe(true)
    expect(result.board[0][0]).toBe(4)
    expect(result.scoreGained).toBe(4)
  })
})

describe('随机生成与不变性', () => {
  it('moveGameState 不修改原状态对象', () => {
    const rng = createSeededRNG(42)
    const state = createGameState(rng)
    const originalBoard = state.board.map((r) => [...r])
    const originalScore = state.score

    moveGameState(state, 'left', rng)

    expect(state.score).toBe(originalScore)
    expect(boardsEqual(state.board, originalBoard)).toBe(true)
  })

  it('无效移动后原棋盘引用不变', () => {
    const rng = createSeededRNG(1)
    const state = {
      ...createGameState(rng),
      board: [
        [2, 4, 8, 16],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
    }
    const after = moveGameState(state, 'left', rng)
    expect(after.board).toBe(state.board)
    expect(after.score).toBe(state.score)
  })
})

describe('addRandomTile 行为', () => {
  it('只在空位生成 2 或 4', () => {
    const rng = createSeededRNG(7)
    const board: Board = [
      [2, 4, 8, 16],
      [32, 64, 128, 256],
      [512, 1024, 0, 0],
      [8, 16, 32, 64],
    ]
    for (let i = 0; i < 50; i++) {
      const beforeEmpty = getEmptyCells(board)
      const { board: newBoard, added } = addRandomTile(board, rng)
      if (added) {
        expect(beforeEmpty.some((p) => p.row === added.row && p.col === added.col)).toBe(true)
        const val = newBoard[added.row][added.col]
        expect(val === 2 || val === 4).toBe(true)
      }
    }
  })
})
