import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import useMobileTouchMove from '../hooks/useMobileTouchMove'

type TouchCallback = (isHorizontal: boolean, offset: number, smoothOffset: boolean, e?: TouchEvent) => boolean

async function setupProbe(impl: TouchCallback = () => true) {
  const callback = vi.fn(impl)
  const Probe = defineComponent(() => {
    const listRef = ref<HTMLDivElement | null>(null)
    useMobileTouchMove(ref(true), listRef, callback)
    return () => h('div', { ref: listRef, class: 'holder' }, [h('span', { class: 'item' }, 'item')])
  })
  const wrapper = mount(Probe, { attachTo: document.body })
  await nextTick()
  return { wrapper, callback, item: wrapper.find('.item').element }
}

function dispatchTouch(el: Element, type: string, pageY: number) {
  const ev = new Event(type, { bubbles: true, cancelable: true }) as any
  ev.touches = [{ pageY, pageX: 0 }]
  el.dispatchEvent(ev)
}

describe('useMobileTouchMove smooth scroll ease out', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    document.body.innerHTML = ''
  })

  // Offset is `start - current`, so moving the finger down gives a negative
  // offset. `Math.floor` never returns 0 for a negative value (-0.9 -> -1),
  // which used to keep the interval running forever.
  it.each([200, -200])('stops easing out when the finger moved by %i', async (move) => {
    const { wrapper, callback, item } = await setupProbe()

    dispatchTouch(item, 'touchstart', 100)
    dispatchTouch(item, 'touchmove', 100 + move)
    dispatchTouch(item, 'touchend', 100 + move)

    // Let the smooth interval run longer than the easing needs.
    vi.advanceTimersByTime(5000)
    const settledCalls = callback.mock.calls.length
    expect(settledCalls).toBeGreaterThan(1)

    // Nothing may happen after it settled.
    vi.advanceTimersByTime(5000)
    expect(callback.mock.calls.length).toBe(settledCalls)

    wrapper.unmount()
  })

  it('stops as soon as the list reports it cannot scroll further', async () => {
    let handled = true
    const { wrapper, callback, item } = await setupProbe(() => {
      const result = handled
      handled = false
      return result
    })

    dispatchTouch(item, 'touchstart', 100)
    dispatchTouch(item, 'touchmove', 300)
    dispatchTouch(item, 'touchend', 300)

    vi.advanceTimersByTime(5000)
    // touchmove + a single interval frame, then it bailed out.
    expect(callback.mock.calls.length).toBe(2)

    vi.advanceTimersByTime(5000)
    expect(callback.mock.calls.length).toBe(2)

    wrapper.unmount()
  })
})

// react-component/virtual-list#390
describe('useMobileTouchMove touchcancel', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('ignores moves after a cancelled touch and accepts the next gesture', async () => {
    const { wrapper, callback, item } = await setupProbe()

    dispatchTouch(item, 'touchstart', 100)
    dispatchTouch(item, 'touchcancel', 100)
    dispatchTouch(item, 'touchmove', 50)
    expect(callback).not.toHaveBeenCalled()

    // A cancelled touch must not leave the hook stuck in the "touched" state.
    dispatchTouch(item, 'touchstart', 100)
    dispatchTouch(item, 'touchmove', 50)
    expect(callback).toHaveBeenCalled()

    wrapper.unmount()
  })
})

// react-component/virtual-list#394
describe('useMobileTouchMove cancelable touchmove', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    document.body.innerHTML = ''
  })

  it('registers a non-passive touchmove listener on the list before any touch starts', async () => {
    const addEventListener = vi.spyOn(HTMLElement.prototype, 'addEventListener')
    const { wrapper } = await setupProbe()
    const holder = wrapper.find('.holder').element

    const listMoveOptions = addEventListener.mock.calls
      .filter(([type], i) => type === 'touchmove' && addEventListener.mock.contexts[i] === holder)
      .map(([, , options]) => options)
    expect(listMoveOptions).toContainEqual(expect.objectContaining({ passive: false }))

    const removeEventListener = vi.spyOn(HTMLElement.prototype, 'removeEventListener')
    wrapper.unmount()
    expect(
      removeEventListener.mock.calls.some(
        ([type], i) => type === 'touchmove' && removeEventListener.mock.contexts[i] === holder,
      ),
    ).toBe(true)
  })

  it('does not preventDefault a non-cancelable touchmove', async () => {
    const { wrapper, callback, item } = await setupProbe()

    dispatchTouch(item, 'touchstart', 100)

    // The browser already started a native scroll, so the move cannot be cancelled
    const moveEvent = new Event('touchmove', { bubbles: true, cancelable: false }) as any
    moveEvent.touches = [{ pageY: 90, pageX: 0 }]
    const preventDefault = vi.spyOn(moveEvent, 'preventDefault')
    item.dispatchEvent(moveEvent)

    expect(callback).toHaveBeenCalled()
    expect(preventDefault).not.toHaveBeenCalled()

    // A cancelable move is still prevented when the list handles it
    const cancelableMove = new Event('touchmove', { bubbles: true, cancelable: true }) as any
    cancelableMove.touches = [{ pageY: 80, pageX: 0 }]
    item.dispatchEvent(cancelableMove)
    expect(cancelableMove.defaultPrevented).toBe(true)

    wrapper.unmount()
  })
})
