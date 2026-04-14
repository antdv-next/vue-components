import { describe, expect, it } from 'vitest'
import useFrameWheel from '../hooks/useFrameWheel'

type Assert<T extends true> = T
type WheelListener = ReturnType<typeof useFrameWheel>[0]
type FireFoxListener = ReturnType<typeof useFrameWheel>[1]

const wheelListenerAssignable: Assert<WheelListener extends (event: WheelEvent) => void ? true : false> = true
const fireFoxListenerAssignable: Assert<FireFoxListener extends EventListener ? true : false> = true

void wheelListenerAssignable
void fireFoxListenerAssignable

describe('useFrameWheel types', () => {
  it('keeps listener types assignable', () => {
    expect(true).toBe(true)
  })
})
