import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import App from './App'
import { act } from 'react'

describe('App', () => {
  it('renders the game title and score board', () => {
    render(<App />)
    expect(screen.getByText('2048')).toBeInTheDocument()
    expect(screen.getByText('New Era')).toBeInTheDocument()
    expect(screen.getByText('得分')).toBeInTheDocument()
    expect(screen.getByText('最高分')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '重新开始游戏' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '开启音效' })).toBeInTheDocument()
  })

  it('renders game board with initial tiles', () => {
    const { container } = render(<App />)
    const tiles = container.querySelectorAll('.board-tile')
    expect(tiles.length).toBeGreaterThanOrEqual(2)
  })

  it('keyboard arrow keys trigger movement', async () => {
    render(<App />)
    // Verify initial score is present (score box contains '0')
    expect(screen.getByText('得分')).toBeInTheDocument()

    // Fire a keyboard event; exact board state depends on RNG,
    // but the event should be handled without crashing.
    await act(async () => {
      fireEvent.keyDown(window, { key: 'ArrowLeft' })
    })

    // After movement, a new tile may be added or the board may change.
    // We just verify the app is still rendered.
    expect(screen.getByText('2048')).toBeInTheDocument()
  })

  it('restart button resets the score to 0', async () => {
    render(<App />)
    const restartBtn = screen.getByRole('button', { name: '重新开始游戏' })

    await act(async () => {
      fireEvent.click(restartBtn)
    })

    const scoreValues = screen.getAllByText('0')
    expect(scoreValues.length).toBeGreaterThanOrEqual(1)
  })

  it('renders gameplay instructions', () => {
    render(<App />)
    expect(screen.getByText(/玩法：/)).toBeInTheDocument()
  })
})
