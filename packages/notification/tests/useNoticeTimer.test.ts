import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { computed, effectScope, nextTick } from 'vue'
import useNoticeTimer from '../src/hooks/useNoticeTimer'

describe('useNoticeTimer', () => {
  let scope: ReturnType<typeof effectScope> | null = null

  beforeEach(() => {
    vi.useFakeTimers()
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(
      cb => setTimeout(() => cb(0), 16) as any,
    )
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(id =>
      clearTimeout(id as any),
    )
  })

  afterEach(() => {
    scope?.stop()
    scope = null
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  function setupTimer(durationSeconds: number) {
    const onUpdate = vi.fn()
    const onClose = vi.fn()
    scope = effectScope()
    const controls = scope.run(() =>
      useNoticeTimer(computed(() => durationSeconds), onClose, onUpdate),
    )!
    return { onUpdate, onClose, resume: controls[0], pause: controls[1] }
  }

  /** Run `count` animation frames (16ms each). */
  async function frames(count: number) {
    for (let i = 0; i < count; i += 1) {
      await vi.advanceTimersByTimeAsync(16)
    }
  }

  it('reports progress and closes once the duration has elapsed', async () => {
    const { onUpdate, onClose } = setupTimer(1)

    await frames(2)
    expect(onUpdate).toHaveBeenLastCalledWith(0.032)

    await vi.advanceTimersByTimeAsync(2000)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('ignores a repeated pause so paused time is not billed to passTime', async () => {
    const { onUpdate, onClose, resume, pause } = setupTimer(1)

    await frames(1)
    pause()
    await nextTick()

    // The list hovering watcher pauses an already paused timer.
    await vi.advanceTimersByTimeAsync(1000)
    pause()

    resume()
    await nextTick()

    expect(onClose).not.toHaveBeenCalled()
    expect(onUpdate.mock.lastCall![0]).toBeLessThan(0.05)

    await vi.advanceTimersByTimeAsync(2000)
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
