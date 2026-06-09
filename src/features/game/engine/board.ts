import type { Board, Position, RNG } from '../types/game'

export const BOARD_SIZE = 4

/**
 * 创建空棋盘，所有格子为 0
 */
export function createEmptyBoard(): Board {
  return Array.from({ length: BOARD_SIZE }, () => Array.from({ length: BOARD_SIZE }, () => 0))
}

/**
 * 深拷贝棋盘
 */
export function cloneBoard(board: Board): Board {
  return board.map((row) => [...row])
}

/**
 * 获取棋盘上所有空位的坐标
 */
export function getEmptyCells(board: Board): Position[] {
  const empties: Position[] = []
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col] === 0) {
        empties.push({ row, col })
      }
    }
  }
  return empties
}

/**
 * 判断两个棋盘是否完全相同
 */
export function boardsEqual(a: Board, b: Board): boolean {
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (a[row][col] !== b[row][col]) return false
    }
  }
  return true
}

/**
 * 在随机空位生成一个新数字
 * - 90% 概率生成 2
 * - 10% 概率生成 4
 * - 如果没有空位，返回原棋盘
 *
 * @param board 当前棋盘
 * @param rng   随机数生成器
 * @returns     生成后的新棋盘，以及生成的位置（未生成则为 null）
 */
export function addRandomTile(
  board: Board,
  rng: RNG = Math.random
): { board: Board; added: Position | null } {
  const empties = getEmptyCells(board)
  if (empties.length === 0) {
    return { board: cloneBoard(board), added: null }
  }

  const idx = Math.floor(rng() * empties.length)
  const pos = empties[idx]
  const value = rng() < 0.9 ? 2 : 4

  const newBoard = cloneBoard(board)
  newBoard[pos.row][pos.col] = value

  return { board: newBoard, added: pos }
}

/**
 * 初始化棋盘：空棋盘 + 随机生成两个数字
 */
export function initBoard(rng: RNG = Math.random): Board {
  let board = createEmptyBoard()
  board = addRandomTile(board, rng).board
  board = addRandomTile(board, rng).board
  return board
}
