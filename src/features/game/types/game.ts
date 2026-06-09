/**
 * 棋盘格子值：0 表示空位，正整数表示 Tile 值
 */
export type Cell = number

/**
 * 4x4 棋盘，使用二维数组，行优先
 */
export type Board = Cell[][]

/**
 * 移动方向
 */
export type Direction = 'up' | 'down' | 'left' | 'right'

/**
 * 坐标
 */
export type Position = {
  row: number
  col: number
}

/**
 * 单次移动结果
 */
export type MoveResult = {
  /** 移动后的新棋盘 */
  board: Board
  /** 本次移动获得的分数 */
  scoreGained: number
  /** 棋盘是否发生了变化 */
  moved: boolean
}

/**
 * 游戏状态
 */
export type GameState = {
  board: Board
  score: number
  bestScore: number
  isOver: boolean
  isWon: boolean
  /** 上一步的方向，undefined 表示还未移动 */
  lastMove?: Direction
}

/**
 * 随机数生成器接口，返回 [0, 1) 之间的浮点数
 * 可注入确定性实现，方便测试
 */
export type RNG = () => number
