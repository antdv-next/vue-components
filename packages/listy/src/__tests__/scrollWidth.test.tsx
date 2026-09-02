import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import Listy from '../List'
import useStickyGroupHeader from '../VirtualList/useStickyGroupHeader'

const items = [
  { id: 1, group: 'A' },
  { id: 2, group: 'A' },
]

describe('scrollWidth', () => {
  it('shows the horizontal scrollbar and widens item and group rows', async () => {
    const wrapper = mount(Listy, {
      props: {
        items,
        rowKey: 'id',
        height: 100,
        itemHeight: 20,
        scrollWidth: 800,
        group: {
          key: 'group',
          title: (key: string) => h('span', key),
        },
        itemRender: (item: { id: number }) => h('span', item.id),
      },
    })

    await nextTick()

    expect(wrapper.find('.vc-listy-scrollbar-horizontal').exists()).toBe(true)
    expect(wrapper.find('.vc-listy-item').attributes('style')).toContain('width: 800px')
    expect(wrapper.find('.vc-listy-group-header').attributes('style')).toContain('width: 800px')
  })

  it('does not force horizontal virtual scrolling when virtual is disabled', () => {
    const wrapper = mount(Listy, {
      props: {
        items,
        rowKey: 'id',
        virtual: false,
        scrollWidth: 800,
        itemRender: (item: { id: number }) => h('span', item.id),
      },
    })

    expect(wrapper.find('.vc-listy-scrollbar-horizontal').exists()).toBe(false)
    expect(wrapper.find('.vc-listy-item').attributes('style') || '').not.toContain('width: 800px')
  })

  it.each([
    ['ltr', -120],
    ['rtl', 120],
  ] as const)('keeps the sticky header aligned when scrolling in %s', async (direction, translatedX) => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    const Tester = defineComponent(() => {
      const extraRender = useStickyGroupHeader({
        enabled: true,
        group: {
          key: 'group',
          title: () => h('span', 'title'),
        },
        groupKeys: ['A'],
        groupKeyToItems: new Map([['A', items]]),
        prefixCls: 'vc-listy',
        listRef: ref({ nativeElement: container }),
        scrollWidth: 800,
      })

      return () => extraRender({
        start: 0,
        end: 1,
        virtual: true,
        offsetX: 120,
        scrollTop: 0,
        offsetY: 0,
        rtl: direction === 'rtl',
        getSize: () => ({ top: 0, bottom: 20 }),
      })
    })

    const wrapper = mount(Tester, { attachTo: document.body })
    await nextTick()

    const stickyHeader = container.querySelector<HTMLElement>('.vc-listy-group-header-fixed')
    expect(stickyHeader?.style.width).toBe('800px')
    expect(stickyHeader?.style.transform).toBe(`translateX(${translatedX}px)`)

    wrapper.unmount()
    container.remove()
  })
})
