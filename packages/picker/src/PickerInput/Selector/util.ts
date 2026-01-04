import type { FormatKey } from './MaskFormat'

export function getMaskRange(key: string): [startVal: number, endVal: number, defaultVal?: number] {
  const PresetRange: Record<FormatKey, [number, number, number?]> = {
    YYYY: [0, 9999, new Date().getFullYear()],
    MM: [1, 12],
    DD: [1, 31],
    HH: [0, 23],
    mm: [0, 59],
    ss: [0, 59],
    SSS: [0, 999],
  }

  return PresetRange[key as FormatKey]
}

export function raf(callback: () => void, delayFrames = 1) {
  let id: number
  let remainingFrames = delayFrames

  function internalCallback() {
    remainingFrames -= 1
    if (remainingFrames <= 0) {
      callback()
    }
    else {
      id = requestAnimationFrame(internalCallback)
    }
  }

  id = requestAnimationFrame(internalCallback)

  return id
}

raf.cancel = (id: number) => {
  cancelAnimationFrame(id)
}
