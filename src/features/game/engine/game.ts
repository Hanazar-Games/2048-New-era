import type { Board, Direction, GameState, RNG } from '../types/game'
import { addRandomTile, getEmptyCells, initBoard } from './board'
import { moveBoard } from './move'

export const WIN_VALUE = 2048

/**
 * 判断棋盘上是否存在指定值（用于检测是否达到 2048）
 */
export function hasValue(board: Board, value: number): boolean {
  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board[r].length; c++) {
      if (board[r][c] === value) return true
    }
  }
  return false
}

/**
 * 判断棋盘是否还能进行任何移动。
 * 条件：有空位，或任意相邻（水平/垂直）存在相同值。
 */
export function canMoveAny(board: Board): boolean {
  // 还有空位 => 一定可以移动
  if (getEmptyCells(board).length > 0) return true

  const size = board.length
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const v = board[r][c]
      // 检查右侧邻居
      if (c + 1 < size && board[r][c + 1] === v) return true
      // 检查下方邻居
      if (r + 1 < size && board[r + 1][c] === v) return true
    }
  }
  return false
}

/**
 * 创建初始游戏状态
 */
export function createGameState(rng: RNG = Math.random): GameState {
  const board = initBoard(rng)
  return {
    board,
    score: 0,
    bestScore: 0,
    isOver: !canMoveAny(board),
    isWon: false,
  }
}

/**
 * 纯函数：执行一次移动。
 * - 如果该方向不产生任何变化，则状态不变，不生成新块。
 * - 如果产生变化，则先移动/合并，再在随机空位生成新块。
 * - 同时更新 score、bestScore、isWon、isOver。
 */
export function moveGameState(
  state: GameState,
  direction: Direction,
  rng: RNG = Math.random
): GameState {
  // 1. 执行移动
  const moveResult = moveBoard(state.board, direction)

  // 2. 无变化则直接返回原状态
  if (!moveResult.moved) {
    return state
  }

  // 3. 在随机空位生成新块
  const afterAdd = addRandomTile(moveResult.board, rng)

  // 4. 更新分数
  const newScore = state.score + moveResult.scoreGained
  const newBestScore = Math.max(state.bestScore, newScore)

  // 5. 检测胜利（一旦达成，isWon 保持 true）
  const newIsWon = state.isWon || hasValue(afterAdd.board, WIN_VALUE)

  // 6. 检测是否无法继续移动
  const newIsOver = !canMoveAny(afterAdd.board)

  return {
    board: afterAdd.board,
    score: newScore,
    bestScore: newBestScore,
    isOver: newIsOver,
    isWon: newIsWon,
    lastMove: direction,
  }
}

/**
 * 重新开始游戏，保留历史最高分
 */
export function restartGameState(prevBestScore: number = 0, rng: RNG = Math.random): GameState {
  const board = initBoard(rng)
  return {
    board,
    score: 0,
    bestScore: prevBestScore,
    isOver: !canMoveAny(board),
    isWon: false,
  }
}
