import { mount } from '@vue/test-utils'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { h, nextTick } from 'vue'

vi.mock('../utils/isFirefox', () => ({
  default: true,
}))

import VirtualList from '../List'

function genData(count: number) {
  return Array.from({ length: count }, (_, index) => ({ id: index, text: `Item ${index}` }))
}

describe('virtualList firefox scroll', () => {
  const originOffsetParent = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetParent')
  const originOffsetHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight')
  const originClientHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientHeight')

  beforeAll(() => {
    Object.defineProperty(HTMLElement.prototype, 'offsetParent', {
      get() {
        return document.body
      },
      configurable: true,
    })

    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
      get() {
        return 20
      },
      configurable: true,
    })

    Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
      get() {
        return 100
      },
      configurable: true,
    })
  })

  afterAll(() => {
    if (originOffsetParent) {
      Object.defineProperty(HTMLElement.prototype, 'offsetParent', originOffsetParent)
    }
    if (originOffsetHeight) {
      Object.defineProperty(HTMLElement.prototype, 'offsetHeight', originOffsetHeight)
    }
    if (originClientHeight) {
      Object.defineProperty(HTMLElement.prototype, 'clientHeight', originClientHeight)
    }
  })

  it('should patch firefox wheel speed without preventing wheel default', async () => {
    const wrapper = mount(VirtualList, {
      props: {
        component: 'ul',
        data: genData(100),
        height: 100,
        itemHeight: 20,
        itemKey: 'id',
      },
      slots: {
        default: ({ item }: any) => h('li', item.text),
      },
    })

    await nextTick()

    const holder = wrapper.find('.vc-virtual-list-holder')
    const holderEl = holder.element as HTMLUListElement

    const wheelPreventDefault = vi.fn()
    const firefoxPreventDefault = vi.fn()

    const wheelEvent = new Event('wheel', { bubbles: true, cancelable: true })
    Object.defineProperty(wheelEvent, 'deltaY', {
      value: 3,
      configurable: true,
    })
    Object.defineProperty(wheelEvent, 'preventDefault', {
      value: wheelPreventDefault,
      configurable: true,
    })

    const firefoxPixelScrollEvent = new Event('MozMousePixelScroll', { bubbles: true, cancelable: true })
    Object.defineProperty(firefoxPixelScrollEvent, 'detail', {
      value: 6,
      configurable: true,
    })
    Object.defineProperty(firefoxPixelScrollEvent, 'preventDefault', {
      value: firefoxPreventDefault,
      configurable: true,
    })

    const firefoxScrollEvent = new Event('DOMMouseScroll', { bubbles: true, cancelable: true })
    Object.defineProperty(firefoxScrollEvent, 'detail', {
      value: 3,
      configurable: true,
    })
    Object.defineProperty(firefoxScrollEvent, 'preventDefault', {
      value: firefoxPreventDefault,
      configurable: true,
    })

    holderEl.dispatchEvent(wheelEvent)
    holderEl.dispatchEvent(firefoxPixelScrollEvent)
    holderEl.dispatchEvent(firefoxScrollEvent)

    await new Promise(resolve => setTimeout(resolve, 20))

    expect(wheelPreventDefault).not.toHaveBeenCalled()
    expect(firefoxPreventDefault).toHaveBeenCalledTimes(1)
    expect(holderEl.scrollTop).toBe(30)
  })

  it('should not prevent firefox pixel scroll at top boundary when scrolling up', () => {
    const wrapper = mount(VirtualList, {
      props: {
        component: 'ul',
        data: genData(100),
        height: 100,
        itemHeight: 20,
        itemKey: 'id',
      },
      slots: {
        default: ({ item }: any) => h('li', item.text),
      },
    })

    const holderEl = wrapper.find('.vc-virtual-list-holder').element as HTMLUListElement
    const preventDefault = vi.fn()

    const event = new Event('MozMousePixelScroll', { bubbles: true, cancelable: true })
    Object.defineProperty(event, 'detail', {
      value: -6,
      configurable: true,
    })
    Object.defineProperty(event, 'preventDefault', {
      value: preventDefault,
      configurable: true,
    })

    holderEl.dispatchEvent(event)

    expect(preventDefault).not.toHaveBeenCalled()
  })
})
