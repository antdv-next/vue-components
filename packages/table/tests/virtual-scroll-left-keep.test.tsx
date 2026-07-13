// @vitest-environment jsdom

import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { VirtualTable } from '../src'

const { virtualListScrollTo, mockScrollInfo } = vi.hoisted(() => ({
  virtualListScrollTo: vi.fn(),
  mockScrollInfo: { x: 0, y: 0 },
}))

vi.mock('@v-c/virtual-list', async () => {
  const { defineComponent, h } = await import('vue')

  return {
    default: defineComponent({
      name: 'VirtualList',
      inheritAttrs: false,
      props: ['data'] as any,
      setup(props, { slots, expose }) {
        expose({
          scrollTo: virtualListScrollTo,
          getScrollInfo: () => ({ ...mockScrollInfo }),
          nativeElement: document.createElement('div'),
        })

        return () =>
          h('div', { class: 'mock-virtual-list' }, (props.data || []).map((item: any, index: number) =>
            slots.default?.({ item, index, style: {} }),
          ))
      },
    }),
  }
})

const columns = [
  { title: 'A', dataIndex: 'a', width: 150 },
  { title: 'B', dataIndex: 'b', width: 150 },
]

function genPage(page: number, size = 30) {
  return Array.from({ length: size }, (_, index) => ({
    key: `${page}-${index}`,
    a: `a-${page}-${index}`,
    b: `b-${page}-${index}`,
  }))
}

describe('virtualTable horizontal scroll keep', () => {
  beforeEach(() => {
    virtualListScrollTo.mockReset()
    mockScrollInfo.x = 0
    mockScrollInfo.y = 0
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('keeps horizontal scroll position when data changes (page switch)', async () => {
    const wrapper = mount(VirtualTable, {
      attachTo: document.body,
      props: {
        data: genPage(1),
        columns,
        scroll: { x: 300, y: 120 },
      },
    })

    await nextTick()

    // Simulate user horizontal scroll: virtual list holds offset 100.
    mockScrollInfo.x = 100
    virtualListScrollTo.mockClear()

    // Switch pagination: replace data.
    await wrapper.setProps({ data: genPage(2) })
    await nextTick()
    await nextTick()
    // Cover the delayed forceScroll retry as well.
    await new Promise(resolve => setTimeout(resolve, 20))

    expect(virtualListScrollTo).not.toHaveBeenCalledWith({ left: 0 })

    wrapper.unmount()
  })
})
