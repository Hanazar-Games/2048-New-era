import { describe, it, expect } from 'vitest'
import {
  createGameState,
  moveGameState,
  restartGameState,
  canMoveAny,
  hasValue,
  WIN_VALUE,
} from './game'
import { createSeededRNG } from '../utils/random'

describe('createGameState', () => {
  it('initializes with two tiles and zero scores', () => {
    const rng = createSeededRNG(42)
    const state = createGameState(rng)
    const nonZero = state.board.flat().filter((v) => v !== 0)
    expect(nonZero).toHaveLength(2)
    expect(state.score).toBe(0)
    expect(state.bestScore).toBe(0)
    expect(state.isOver).toBe(false)
    expect(state.isWon).toBe(false)
  })
})

describe('moveGameState', () => {
  it('does not change state on invalid move', () => {
    const rng = createSeededRNG(1)
    const state = createGameState(rng)
    // 找一个方向做两次，第二次应该是无效的
    // 直接构造一个无法左移的棋盘进行测试
    const fixedState = {
      ...state,
      board: [
        [2, 4, 8, 16],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
    }
    const afterLeft = moveGameState(fixedState, 'left', rng)
    expect(afterLeft.board).toEqual(fixedState.board)
    expect(afterLeft.score).toBe(fixedState.score)
  })

  it('adds a new tile after a valid move', () => {
    const rng = createSeededRNG(7)
    const state = {
      ...createGameState(rng),
      board: [
        [2, 0, 0, 0],
        [2, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
    }
    const after = moveGameState(state, 'up', rng)
    const nonZero = after.board.flat().filter((v) => v !== 0)
    // 合并了两个 2 -> 4，然后新增一个块，所以应该有 2 个非零块
    expect(nonZero).toHaveLength(2)
    expect(after.score).toBe(4)
    expect(after.lastMerged).toEqual([{ row: 0, col: 0 }])
    expect(after.lastAdded).toBeDefined()
  })

  it('updates bestScore when new score exceeds it', () => {
    const rng = createSeededRNG(99)
    const state = {
      ...createGameState(rng),
      board: [
        [2, 0, 0, 0],
        [2, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
      score: 100,
      bestScore: 100,
    }
    const after = moveGameState(state, 'up', rng)
    expect(after.bestScore).toBe(104)
  })

  it('detects win when 2048 is reached', () => {
    const rng = createSeededRNG(1)
    const state = {
      ...createGameState(rng),
      board: [
        [1024, 1024, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
    }
    const after = moveGameState(state, 'left', rng)
    expect(after.isWon).toBe(true)
    expect(after.score).toBe(2048)
  })

  it('detects game over when no moves remain after a valid move', () => {
    const rng = createSeededRNG(0)
    // 构造一个棋盘：向上移动并生成新块后刚好死局
    const state = {
      ...createGameState(rng),
      board: [
        [2, 4, 8, 16],
        [4, 8, 16, 2],
        [8, 16, 2, 0],
        [16, 2, 4, 8],
      ],
    }
    const after = moveGameState(state, 'up', rng)
    expect(after.isOver).toBe(true)
    expect(after.board).toEqual([
      [2, 4, 8, 16],
      [4, 8, 16, 2],
      [8, 16, 2, 8],
      [16, 2, 4, 2],
    ])
  })
})

describe('canMoveAny', () => {
  it('returns true when empty cells exist', () => {
    const board = [
      [2, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]
    expect(canMoveAny(board)).toBe(true)
  })

  it('returns true when adjacent equal values exist on full board', () => {
    const board = [
      [2, 4, 2, 4],
      [4, 2, 4, 2],
      [2, 4, 2, 4],
      [4, 2, 4, 4],
    ]
    expect(canMoveAny(board)).toBe(true)
  })

  it('returns false for a deadlocked full board', () => {
    const board = [
      [2, 4, 2, 4],
      [4, 2, 4, 2],
      [2, 4, 2, 4],
      [4, 2, 4, 2],
    ]
    expect(canMoveAny(board)).toBe(false)
  })
})

describe('hasValue', () => {
  it('returns true when value exists', () => {
    const board = [
      [1024, 1024, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]
    expect(hasValue(board, 1024)).toBe(true)
  })

  it('returns false when value does not exist', () => {
    const board = [
      [2, 4, 8, 16],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]
    expect(hasValue(board, WIN_VALUE)).toBe(false)
  })
})

describe('restartGameState', () => {
  it('resets everything except bestScore', () => {
    const rng = createSeededRNG(55)
    const restarted = restartGameState(500, rng)
    expect(restarted.score).toBe(0)
    expect(restarted.bestScore).toBe(500)
    expect(restarted.isOver).toBe(false)
    expect(restarted.isWon).toBe(false)
    expect(restarted.lastAdded).toBeUndefined()
    expect(restarted.lastMerged).toEqual([])
    const nonZero = restarted.board.flat().filter((v) => v !== 0)
    expect(nonZero).toHaveLength(2)
  })
})
