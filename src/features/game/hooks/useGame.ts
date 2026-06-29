import { useCallback, useEffect, useRef, useState } from 'react'
import type { Direction, GameState } from '../types/game'
import { createGameState, moveGameState, restartGameState } from '../engine/game'
import { loadBestScore, saveBestScore } from '../utils/storage'

const TOUCH_THRESHOLD = 30
const MOVE_LOCK_MS = 120

export type UseGameReturn = {
  state: GameState
  restart: () => void
  dismissWin: () => void
  onTouchStart: (e: React.TouchEvent) => void
  onTouchMove: (e: React.TouchEvent) => void
  onTouchEnd: (e: React.TouchEvent) => void
  showWinOverlay: boolean
}

export function useGame(): UseGameReturn {
  const [state, setState] = useState<GameState>(() => {
    const initial = createGameState()
    return { ...initial, bestScore: Math.max(initial.bestScore, loadBestScore()) }
  })

  const [isWinDismissed, setIsWinDismissed] = useState(false)

  const touchStartRef = useRef<{ x: number; y: number; id: number } | null>(null)
  const moveLockRef = useRef(false)
  const moveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sync mutable refs inside an effect so event handlers always see fresh values
  // without forcing the effect (and its listener) to re-register.
  const isOverRef = useRef(state.isOver)
  const isWonRef = useRef(state.isWon)
  const stateRef = useRef(state)
  const isWinDismissedRef = useRef(isWinDismissed)

  useEffect(() => {
    stateRef.current = state
    isOverRef.current = state.isOver
    isWonRef.current = state.isWon
  }, [state])

  useEffect(() => {
    isWinDismissedRef.current = isWinDismissed
  }, [isWinDismissed])

  const showWinOverlay = state.isWon && !isWinDismissed && !state.isOver

  const releaseMoveLock = useCallback(() => {
    moveLockRef.current = false
  }, [])

  const move = useCallback(
    (direction: Direction) => {
      if (moveLockRef.current || isOverRef.current) return

      const current = stateRef.current
      const next = moveGameState(current, direction)
      if (next === current) return

      moveLockRef.current = true

      if (next.bestScore > current.bestScore) {
        saveBestScore(next.bestScore)
      }
      stateRef.current = next
      isOverRef.current = next.isOver
      isWonRef.current = next.isWon
      setState(next)

      if (moveTimerRef.current) {
        clearTimeout(moveTimerRef.current)
      }
      moveTimerRef.current = setTimeout(releaseMoveLock, MOVE_LOCK_MS)
    },
    [releaseMoveLock]
  )

  const restart = useCallback(() => {
    if (moveTimerRef.current) {
      clearTimeout(moveTimerRef.current)
      moveTimerRef.current = null
    }
    moveLockRef.current = false
    setIsWinDismissed(false)
    setState((prev) => {
      const next = restartGameState(prev.bestScore)
      stateRef.current = next
      isOverRef.current = next.isOver
      isWonRef.current = next.isWon
      return next
    })
  }, [])

  const dismissWin = useCallback(() => {
    setIsWinDismissed(true)
  }, [])

  const handleDirectionKey = useCallback(
    (direction: Direction) => {
      // If win overlay is visible, dismiss it first then move
      if (isWonRef.current && !isWinDismissedRef.current) {
        dismissWin()
      }
      move(direction)
    },
    [move, dismissWin]
  )

  // Keyboard controls — registered once because all deps are stable callbacks/refs.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Game over: Enter / Space restarts
      if (isOverRef.current) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          restart()
        }
        return
      }

      // Win overlay visible: Enter / Space dismisses it;
      // Arrow keys / WASD dismiss and immediately move (standard 2048 behavior)
      if (isWonRef.current && !isWinDismissedRef.current) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          dismissWin()
          return
        }
        // Fall through for direction keys so user can continue without
        // an explicit dismiss step.
      }

      // Normal gameplay (or continuing after win dismissal)
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault()
          handleDirectionKey('up')
          break
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault()
          handleDirectionKey('down')
          break
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault()
          handleDirectionKey('left')
          break
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault()
          handleDirectionKey('right')
          break
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleDirectionKey, restart, dismissWin])

  // Touch / swipe controls
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length !== 1) return
    const t = e.touches[0]
    touchStartRef.current = { x: t.clientX, y: t.clientY, id: t.identifier }
  }, [])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    // Prevent page scrolling while swiping on the board area.
    // CSS touch-action: none handles most cases; this is a safety net.
    if (e.touches.length === 1) {
      e.preventDefault()
    }
  }, [])

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const start = touchStartRef.current
      if (!start) return

      // Only process the swipe if the released touch matches the one we started with.
      // This prevents false swipes when a second finger touches and the first is released.
      const t = e.changedTouches[0]
      if (!t || t.identifier !== start.id) {
        touchStartRef.current = null
        return
      }

      const dx = t.clientX - start.x
      const dy = t.clientY - start.y
      const absDx = Math.abs(dx)
      const absDy = Math.abs(dy)

      touchStartRef.current = null

      if (Math.max(absDx, absDy) < TOUCH_THRESHOLD) return

      // When game is over, ignore swipes (user must click the overlay button)
      if (isOverRef.current) return

      const direction = absDx > absDy ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up'

      // Match keyboard behavior: a directional swipe dismisses the win overlay and continues.
      if (isWonRef.current && !isWinDismissedRef.current) {
        dismissWin()
      }

      move(direction)
    },
    [move, dismissWin]
  )

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (moveTimerRef.current) {
        clearTimeout(moveTimerRef.current)
      }
    }
  }, [])

  return {
    state,
    restart,
    dismissWin,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    showWinOverlay,
  }
}
