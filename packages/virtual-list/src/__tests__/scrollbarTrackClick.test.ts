import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import ScrollBar from '../ScrollBar'

function createMouseDown(position: { pageX?: number, pageY?: number, button?: number }) {
  const event = new MouseEvent('mousedown', {
    bubbles: true,
    cancelable: true,
    button: position.button ?? 0,
  })
  if (position.pageX !== undefined) {
    Object.defineProperty(event, 'pageX', { value: position.pageX })
  }
  if (position.pageY !== undefined) {
    Object.defineProperty(event, 'pageY', { value: position.pageY })
  }
  return event
}

function mountScrollBar(props: Record<string, any> = {}) {
  const onScroll = vi.fn()
  const wrapper = mount(ScrollBar, {
    props: {
      prefixCls: 'vc-virtual-list',
      scrollOffset: 0,
      scrollRange: 2000,
      rtl: false,
      onScroll,
      onStartMove: vi.fn(),
      onStopMove: vi.fn(),
      spinSize: 20,
      containerSize: 100,
      ...props,
    } as any,
  })

  const scrollbarEl = wrapper.find('.vc-virtual-list-scrollbar').element as HTMLDivElement
  scrollbarEl.getBoundingClientRect = () => ({
    top: 0,
    bottom: 100,
    left: 0,
    right: 100,
    width: 100,
    height: 100,
  } as DOMRect)

  return { wrapper, onScroll, scrollbarEl }
}

describe('scrollBar track click', () => {
  it('click vertical track to scroll', () => {
    const { onScroll, scrollbarEl } = mountScrollBar()

    scrollbarEl.dispatchEvent(createMouseDown({ pageY: 50 }))

    // enableScrollRange = 1900, enableOffsetRange = 80
    // nextTop = 50 - 0 - 20 / 2 = 40 -> ceil(40 / 80 * 1900) = 950
    expect(onScroll).toHaveBeenCalledWith(950, undefined)
  })

  it('click horizontal track to scroll', () => {
    const { onScroll, scrollbarEl } = mountScrollBar({
      scrollRange: 1000,
      horizontal: true,
    })

    scrollbarEl.dispatchEvent(createMouseDown({ pageX: 30 }))

    // enableScrollRange = 900, enableOffsetRange = 80
    // nextTop = 30 - 0 - 20 / 2 = 20 -> ceil(20 / 80 * 900) = 225
    expect(onScroll).toHaveBeenCalledWith(225, true)
  })

  it('click horizontal track to scroll in rtl', () => {
    const { onScroll, scrollbarEl } = mountScrollBar({
      scrollRange: 1000,
      horizontal: true,
      rtl: true,
    })

    scrollbarEl.dispatchEvent(createMouseDown({ pageX: 30 }))

    // nextTop = 100 - 30 - 20 / 2 = 60 -> ceil(60 / 80 * 900) = 675
    expect(onScroll).toHaveBeenCalledWith(675, true)
  })

  it('clamps track click offset into scroll range', () => {
    const { onScroll, scrollbarEl } = mountScrollBar()

    scrollbarEl.dispatchEvent(createMouseDown({ pageY: 100 }))

    expect(onScroll).toHaveBeenCalledWith(1900, undefined)
  })

  it('ignores non-left-button click', () => {
    const { onScroll, scrollbarEl } = mountScrollBar()

    scrollbarEl.dispatchEvent(createMouseDown({ pageY: 50, button: 2 }))

    expect(onScroll).not.toHaveBeenCalled()
  })

  it('ignores mousedown on thumb', () => {
    const { wrapper, onScroll } = mountScrollBar()

    const thumbEl = wrapper.find('.vc-virtual-list-scrollbar-thumb').element as HTMLDivElement
    thumbEl.dispatchEvent(createMouseDown({ pageY: 50 }))

    expect(onScroll).not.toHaveBeenCalled()
  })
})
