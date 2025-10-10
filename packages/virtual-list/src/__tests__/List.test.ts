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
})
