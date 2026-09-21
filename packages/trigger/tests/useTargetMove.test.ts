import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { effectScope, nextTick, ref, shallowRef } from 'vue'
import useTargetMove from '../src/hooks/useTargetMove.ts'

function createTarget(x: number, y: number) {
  const element = document.createElement('div')
  const pos = { x, y }

  Object.defineProperty(element, 'getBoundingClientRect', {
    configurable: true,
    value: () => new DOMRect(pos.x, pos.y, 100, 30),
  })

  document.body.appendChild(element)

  return { element, moveTo: (nextX: number, nextY: number) => Object.assign(pos, { x: nextX, y: nextY }) }
}

describe('useTargetMove', () => {
  let scope: ReturnType<typeof effectScope> | null = null
  let rafSpy: ReturnType<typeof vi.spyOn>
  let cafSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.useFakeTimers()
    rafSpy = vi
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation(cb => setTimeout(() => cb(0), 16) as any)
    cafSpy = vi
      .spyOn(window, 'cancelAnimationFrame')
      .mockImplementation(id => clearTimeout(id as any))
  })

  afterEach(() => {
    scope?.stop()
    scope = null
    rafSpy.mockRestore()
    cafSpy.mockRestore()
    document.body.innerHTML = ''
    vi.useRealTimers()
  })

  /** Run `count` animation frames. */
  async function frames(count: number) {
    for (let i = 0; i < count; i += 1) {
      await vi.advanceTimersByTimeAsync(16)
    }
    await nextTick()
  }

  it('re-aligns when the target moves without scrolling or resizing', async () => {
    // A target relocated by an ancestor mid-transition (a collapsing sider, a
    // drawer sliding in) fires neither scroll nor resize, so without this the
    // popup stays where the target was when it opened.
    const { element, moveTo } = createTarget(50, 100)
    const onAlign = vi.fn()

    scope = effectScope()
    scope.run(() => {
      useTargetMove(ref(true), shallowRef(element) as any, onAlign)
    })

    await frames(2)
    expect(onAlign).not.toHaveBeenCalled()

    moveTo(400, 100)
    await frames(2)
    expect(onAlign).toHaveBeenCalledTimes(1)

    moveTo(400, 260)
    await frames(2)
    expect(onAlign).toHaveBeenCalledTimes(2)
  })

  it('stays quiet while the target holds still', async () => {
    const { element } = createTarget(50, 100)
    const onAlign = vi.fn()

    scope = effectScope()
    scope.run(() => {
      useTargetMove(ref(true), shallowRef(element) as any, onAlign)
    })

    await frames(10)
    expect(onAlign).not.toHaveBeenCalled()
  })

  it('stops sampling once closed', async () => {
    const { element, moveTo } = createTarget(50, 100)
    const onAlign = vi.fn()
    const open = ref(true)

    scope = effectScope()
    scope.run(() => {
      useTargetMove(open, shallowRef(element) as any, onAlign)
    })

    await frames(2)
    open.value = false
    await nextTick()

    moveTo(400, 100)
    await frames(5)
    expect(onAlign).not.toHaveBeenCalled()
  })

  it('parks itself once the target has held still', async () => {
    // Reading a rect forces a layout, so an open popup must not cost one every
    // frame for as long as it stays open.
    const { element, moveTo } = createTarget(50, 100)
    const onAlign = vi.fn()

    scope = effectScope()
    scope.run(() => {
      useTargetMove(ref(true), shallowRef(element) as any, onAlign)
    })

    await frames(30)
    const sampledWhileMoving = rafSpy.mock.calls.length

    await frames(10)
    expect(rafSpy.mock.calls.length).toBe(sampledWhileMoving)

    moveTo(400, 100)
    await frames(5)
    expect(onAlign).not.toHaveBeenCalled()
  })

  it('comes back when something may move the target again', async () => {
    const { element, moveTo } = createTarget(50, 100)
    const onAlign = vi.fn()

    scope = effectScope()
    scope.run(() => {
      useTargetMove(ref(true), shallowRef(element) as any, onAlign)
    })

    // Park it, then move the target while nothing is watching.
    await frames(30)
    moveTo(400, 100)
    await frames(2)
    expect(onAlign).not.toHaveBeenCalled()

    // An ancestor starting a transition is exactly the case this exists for.
    document.dispatchEvent(new Event('transitionrun', { bubbles: true }))
    await frames(2)
    expect(onAlign).toHaveBeenCalledTimes(1)

    await frames(30)
    moveTo(400, 260)
    await frames(2)
    expect(onAlign).toHaveBeenCalledTimes(1)

    // A drag moves the target with no transition and no scroll.
    document.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    await frames(2)
    expect(onAlign).toHaveBeenCalledTimes(2)
  })

  it('keeps sampling for the length of a drag', async () => {
    // The target moves for as long as the drag lasts, so the ordinary idle
    // cutoff must not park the loop in the middle of one.
    const { element, moveTo } = createTarget(50, 100)
    const onAlign = vi.fn()

    scope = effectScope()
    scope.run(() => {
      useTargetMove(ref(true), shallowRef(element) as any, onAlign)
    })

    document.dispatchEvent(new Event('pointerdown', { bubbles: true }))

    // Well past the cutoff that applies when no pointer is down.
    await frames(40)
    moveTo(400, 100)
    await frames(2)
    expect(onAlign).toHaveBeenCalledTimes(1)
  })

  it('parks even if the end of a drag is never seen', async () => {
    // A release outside the window can leave the drag looking open forever.
    // The loop has to stop on its own rather than trust that it will hear.
    const { element, moveTo } = createTarget(50, 100)
    const onAlign = vi.fn()

    scope = effectScope()
    scope.run(() => {
      useTargetMove(ref(true), shallowRef(element) as any, onAlign)
    })

    document.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    // No pointerup — nothing moves, so the drag cap is what stops it.
    await frames(610)

    const parked = rafSpy.mock.calls.length
    await frames(10)
    expect(rafSpy.mock.calls.length).toBe(parked)

    moveTo(400, 100)
    await frames(5)
    expect(onAlign).not.toHaveBeenCalled()
  })

  it('a pointer release lets the ordinary cutoff apply again', async () => {
    const { element, moveTo } = createTarget(50, 100)
    const onAlign = vi.fn()

    scope = effectScope()
    scope.run(() => {
      useTargetMove(ref(true), shallowRef(element) as any, onAlign)
    })

    document.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    await frames(2)
    window.dispatchEvent(new Event('pointerup'))

    await frames(30)
    moveTo(400, 100)
    await frames(2)
    expect(onAlign).not.toHaveBeenCalled()
  })

  it('stops listening once closed', async () => {
    const { element, moveTo } = createTarget(50, 100)
    const onAlign = vi.fn()
    const open = ref(true)

    scope = effectScope()
    scope.run(() => {
      useTargetMove(open, shallowRef(element) as any, onAlign)
    })

    await frames(2)
    open.value = false
    await nextTick()

    moveTo(400, 100)
    document.dispatchEvent(new Event('transitionrun', { bubbles: true }))
    await frames(5)
    expect(onAlign).not.toHaveBeenCalled()
  })

  it('does not sample an alignPoint target or in mobile mode', async () => {
    const { element, moveTo } = createTarget(50, 100)

    const pointAlign = vi.fn()
    const mobileAlign = vi.fn()

    scope = effectScope()
    scope.run(() => {
      // alignPoint hands over a mouse position, not an element
      useTargetMove(ref(true), shallowRef([10, 20]) as any, pointAlign)
      useTargetMove(ref(true), shallowRef(element) as any, mobileAlign, ref(true))
    })

    moveTo(400, 100)
    await frames(5)

    expect(pointAlign).not.toHaveBeenCalled()
    expect(mobileAlign).not.toHaveBeenCalled()
  })
})
