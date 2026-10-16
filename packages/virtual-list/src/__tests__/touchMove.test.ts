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
