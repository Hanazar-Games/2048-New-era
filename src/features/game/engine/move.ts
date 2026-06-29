import type { Board, Direction, MoveResult, Position } from '../types/game'
import { BOARD_SIZE, cloneBoard, createEmptyBoard } from './board'

/**
 * 对单行向左滑动：压缩空位、合并相邻相同值、再压缩空位。
 * 核心约束：同一轮中，每个数字块仅参与一次合并。
 *
 * 示例：
 *   [2, 2, 2, 2] -> [4, 4, 0, 0]（不是 [8, 0, 0, 0]）
 *   [2, 0, 2, 4] -> [4, 4, 0, 0]
 *   [4, 0, 4, 4] -> [8, 4, 0, 0]
 */
function slideRowLeft(row: number[]): { row: number[]; score: number; mergedCols: number[] } {
  // 1. 过滤空位
  const nonZero = row.filter((v) => v !== 0)

  // 2. 合并相邻相同值，仅合并一次
  const merged: number[] = []
  const mergedCols: number[] = []
  let score = 0
  let skipNext = false

  for (let i = 0; i < nonZero.length; i++) {
    if (skipNext) {
      skipNext = false
      continue
    }
    if (i + 1 < nonZero.length && nonZero[i] === nonZero[i + 1]) {
      const value = nonZero[i] * 2
      mergedCols.push(merged.length)
      merged.push(value)
      score += value
      skipNext = true
    } else {
      merged.push(nonZero[i])
    }
  }

  // 3. 右侧补空位
  while (merged.length < row.length) {
    merged.push(0)
  }

  return { row: merged, score, mergedCols }
}

/**
 * 矩阵转置：行变列、列变行
 */
function transpose(board: Board): Board {
  const result = createEmptyBoard()
  for (let i = 0; i < BOARD_SIZE; i++) {
    for (let j = 0; j < BOARD_SIZE; j++) {
      result[i][j] = board[j][i]
    }
  }
  return result
}

/**
 * 水平翻转每一行
 */
function reverseRows(board: Board): Board {
  return board.map((row) => [...row].reverse())
}

/**
 * 对整张棋盘执行向左滑动
 */
function slideBoardLeft(board: Board): MoveResult {
  let totalScore = 0
  const newBoard: Board = []
  const mergedPositions: Position[] = []
  let moved = false

  for (let r = 0; r < BOARD_SIZE; r++) {
    const { row: newRow, score, mergedCols } = slideRowLeft(board[r])
    newBoard.push(newRow)
    totalScore += score
    mergedCols.forEach((col) => mergedPositions.push({ row: r, col }))
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] !== newRow[c]) {
        moved = true
      }
    }
  }

  return { board: newBoard, scoreGained: totalScore, moved, mergedPositions }
}

function mapRightPosition(pos: Position): Position {
  return { row: pos.row, col: BOARD_SIZE - 1 - pos.col }
}

function mapUpPosition(pos: Position): Position {
  return { row: pos.col, col: pos.row }
}

function mapDownPosition(pos: Position): Position {
  return { row: BOARD_SIZE - 1 - pos.col, col: pos.row }
}

/**
 * 按指定方向移动棋盘。
 * 该函数是纯函数，不处理随机生成新块，仅返回移动/合并后的结果。
 */
export function moveBoard(board: Board, direction: Direction): MoveResult {
  switch (direction) {
    case 'left':
      return slideBoardLeft(board)

    case 'right': {
      const reversed = reverseRows(board)
      const result = slideBoardLeft(reversed)
      return {
        board: reverseRows(result.board),
        scoreGained: result.scoreGained,
        moved: result.moved,
        mergedPositions: result.mergedPositions.map(mapRightPosition),
      }
    }

    case 'up': {
      const transposed = transpose(board)
      const result = slideBoardLeft(transposed)
      return {
        board: transpose(result.board),
        scoreGained: result.scoreGained,
        moved: result.moved,
        mergedPositions: result.mergedPositions.map(mapUpPosition),
      }
    }

    case 'down': {
      const transposed = transpose(board)
      const reversed = reverseRows(transposed)
      const result = slideBoardLeft(reversed)
      return {
        board: transpose(reverseRows(result.board)),
        scoreGained: result.scoreGained,
        moved: result.moved,
        mergedPositions: result.mergedPositions.map(mapDownPosition),
      }
    }

    default:
      // exhaustive check
      return { board: cloneBoard(board), scoreGained: 0, moved: false, mergedPositions: [] }
  }
}

/**
 * 判断指定方向上棋盘是否可以移动（即该方向操作会产生变化）。
 * 用于避免无效移动时生成新块，也可用于游戏结束检测。
 */
export function canMoveInDirection(board: Board, direction: Direction): boolean {
  return moveBoard(board, direction).moved
}
