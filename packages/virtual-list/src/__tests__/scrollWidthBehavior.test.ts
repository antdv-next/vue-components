import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { h, nextTick } from 'vue'
import VirtualList from '../List'

function genData(count: number) {
  return Array.from({ length: count }, (_, index) => ({ id: index, text: `Item ${index}` }))
}

describe('virtualList scrollWidth behavior', () => {
  it('should convert shift+wheel to horizontal scroll when scrollWidth is set', async () => {
    const onVirtualScroll = vi.fn()

    const wrapper = mount(VirtualList, {
      props: {
        component: 'ul',
        data: genData(100),
        height: 100,
        itemHeight: 20,
        itemKey: 'id',
        scrollWidth: 1000,
        onVirtualScroll,
      },
      slots: {
        default: ({ item }: any) => h('li', item.text),
      },
    })

    await nextTick()

    const holderEl = wrapper.find('.vc-virtual-list-holder').element as HTMLUListElement
    holderEl.dispatchEvent(new WheelEvent('wheel', {
      bubbles: true,
      cancelable: true,
      deltaY: 123,
      shiftKey: true,
    }))

    expect(onVirtualScroll).toHaveBeenCalledWith({ x: 123, y: 0 })
  })

  it('should use updated scrollWidth for horizontal wheel detection', async () => {
    const onVirtualScroll = vi.fn()

    const wrapper = mount(VirtualList, {
      props: {
        component: 'ul',
        data: genData(100),
        height: 100,
        itemHeight: 20,
        itemKey: 'id',
        onVirtualScroll,
      },
      slots: {
        default: ({ item }: any) => h('li', item.text),
      },
    })

    await wrapper.setProps({
      scrollWidth: 1000,
    })
    await nextTick()
    onVirtualScroll.mockClear()

    const holderEl = wrapper.find('.vc-virtual-list-holder').element as HTMLUListElement
    holderEl.dispatchEvent(new WheelEvent('wheel', {
      bubbles: true,
      cancelable: true,
      deltaX: 123,
    }))

    expect(onVirtualScroll).toHaveBeenCalledWith({ x: 123, y: 0 })
  })
})
