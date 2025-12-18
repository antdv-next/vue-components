import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import VirtualList from '../List'

describe('virtualList', () => {
  it('should render basic list', () => {
    const data = Array.from({ length: 100 }, (_, i) => ({ id: i, text: `Item ${i}` }))

    const wrapper = mount(VirtualList, {
      props: {
        data,
        height: 200,
        itemHeight: 20,
        itemKey: 'id',
      },
      slots: {
        default: ({ item }: any) => h('div', `${item.text}`),
      },
    })

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.vc-virtual-list').exists()).toBe(true)
  })

  it('should handle empty data', () => {
    const wrapper = mount(VirtualList, {
      props: {
        data: [],
        height: 200,
        itemHeight: 20,
        itemKey: 'id',
      },
      slots: {
        default: ({ item }: any) => h('div', `${item.text}`),
      },
    })

    expect(wrapper.exists()).toBe(true)
  })

  it('should work with function itemKey', () => {
    const data = Array.from({ length: 100 }, (_, i) => ({ id: i, text: `Item ${i}` }))

    const wrapper = mount(VirtualList, {
      props: {
        data,
        height: 200,
        itemHeight: 20,
        itemKey: (item: any) => item.id,
      },
      slots: {
        default: ({ item }: any) => h('div', `${item.text}`),
      },
    })

    expect(wrapper.exists()).toBe(true)
  })

  it('should keep native scroll when not in virtual range', () => {
    // `itemHeight` is smaller than real item height, so `inVirtual` is false.
    // In this case we still need native scroll to work (do not lock overflow).
    const data = Array.from({ length: 10 }, (_, i) => ({ id: i }))

    const wrapper = mount(VirtualList, {
      props: {
        data,
        height: 100,
        itemHeight: 1,
        itemKey: 'id',
      },
      slots: {
        default: ({ item }: any) => h('div', { style: { height: '30px' } }, `${item.id}`),
      },
    })

    const holder = wrapper.find('.vc-virtual-list-holder')
    expect(holder.exists()).toBe(true)
    expect((holder.element as HTMLElement).style.overflowY).toBe('auto')
  })

  it('should not clamp scrollTop when inVirtual is false', async () => {
    const data = Array.from({ length: 10 }, (_, i) => ({ id: i }))

    const wrapper = mount(VirtualList, {
      props: {
        data,
        height: 100,
        itemHeight: 1,
        itemKey: 'id',
      },
      slots: {
        default: ({ item }: any) => h('div', { style: { height: '30px' } }, `${item.id}`),
      },
    })

    const holder = wrapper.find('.vc-virtual-list-holder')
    const holderEl = holder.element as HTMLDivElement

    holderEl.scrollTop = 50
    await holder.trigger('scroll')

    // When `inVirtual` is false, the list should keep native scrolling and not clamp back to 0.
    expect(holderEl.scrollTop).toBe(50)
  })
})
