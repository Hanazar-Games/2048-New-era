import type { RNG } from '../types/game'

/**
 * 默认随机数生成器：Math.random
 */
export const defaultRNG: RNG = () => Math.random()

/**
 * 创建一个基于线性同余生成器（LCG）的确定性随机数生成器
 * 用于测试，保证可重复性
 */
export function createSeededRNG(seed: number): RNG {
  let state = seed >>> 0
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 4294967296
  }
}
