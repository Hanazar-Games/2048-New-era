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
  /** 本次移动中发生合并的位置 */
  mergedPositions: Position[]
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
  /** 上一步新增数字块的位置 */
  lastAdded?: Position
  /** 上一步合并数字块的位置 */
  lastMerged: Position[]
}

/**
 * 随机数生成器接口，返回 [0, 1) 之间的浮点数
 * 可注入确定性实现，方便测试
 */
export type RNG = () => number
