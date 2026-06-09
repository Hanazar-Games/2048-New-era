import { describe, it, expect, beforeEach } from 'vitest'
import { loadBestScore, saveBestScore } from './storage'

const KEY = '2048-best-score'

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns 0 when localStorage is empty', () => {
    expect(loadBestScore()).toBe(0)
  })

  it('loads a previously saved score', () => {
    saveBestScore(128)
    expect(loadBestScore()).toBe(128)
  })

  it('updates best score', () => {
    saveBestScore(64)
    saveBestScore(256)
    expect(loadBestScore()).toBe(256)
  })

  it('returns 0 for invalid stored value', () => {
    localStorage.setItem(KEY, 'not-a-number')
    expect(loadBestScore()).toBe(0)
  })

  it('returns 0 for negative stored value', () => {
    localStorage.setItem(KEY, '-10')
    expect(loadBestScore()).toBe(0)
  })

  it('returns 0 for Infinity', () => {
    localStorage.setItem(KEY, 'Infinity')
    expect(loadBestScore()).toBe(0)
  })

  it('handles localStorage errors gracefully', () => {
    const originalSetItem = localStorage.setItem
    localStorage.setItem = () => {
      throw new Error('QuotaExceededError')
    }
    expect(() => saveBestScore(100)).not.toThrow()
    localStorage.setItem = originalSetItem
  })
})
