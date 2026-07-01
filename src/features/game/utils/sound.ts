export type SoundEvent = 'move' | 'merge' | 'win' | 'game-over'

type WebAudioWindow = Window & {
  webkitAudioContext?: typeof AudioContext
}

const SOUND_PATTERNS: Record<SoundEvent, Array<{ frequency: number; duration: number }>> = {
  move: [{ frequency: 220, duration: 0.055 }],
  merge: [
    { frequency: 330, duration: 0.055 },
    { frequency: 440, duration: 0.075 },
  ],
  win: [
    { frequency: 523, duration: 0.08 },
    { frequency: 659, duration: 0.08 },
    { frequency: 784, duration: 0.12 },
  ],
  'game-over': [
    { frequency: 196, duration: 0.09 },
    { frequency: 147, duration: 0.16 },
  ],
}

let audioContext: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const audioWindow = window as WebAudioWindow
  const AudioContextCtor = globalThis.AudioContext ?? audioWindow.webkitAudioContext
  if (!AudioContextCtor) return null

  audioContext ??= new AudioContextCtor()
  if (audioContext.state === 'suspended') {
    void audioContext.resume()
  }
  return audioContext
}

function playTone(context: AudioContext, frequency: number, start: number, duration: number): void {
  const oscillator = context.createOscillator()
  const gain = context.createGain()

  oscillator.type = 'sine'
  oscillator.frequency.setValueAtTime(frequency, start)
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(0.055, start + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)

  oscillator.connect(gain)
  gain.connect(context.destination)
  oscillator.start(start)
  oscillator.stop(start + duration + 0.02)
}

export function playSound(event: SoundEvent): void {
  try {
    const context = getAudioContext()
    if (!context) return

    const pattern = SOUND_PATTERNS[event]
    let start = context.currentTime
    pattern.forEach(({ frequency, duration }) => {
      playTone(context, frequency, start, duration)
      start += duration + 0.025
    })
  } catch {
    // Audio is decorative; failures should never affect gameplay.
  }
}
