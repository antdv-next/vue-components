// @vitest-environment jsdom

import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import Table, { VirtualTable } from '../src'

// Render every row so the virtual cases can be exercised without real windowing.
vi.mock('@v-c/virtual-list', async () => {
  const { defineComponent: define, h: createElement } = await import('vue')
  return {
    default: define({
      name: 'VirtualList',
      inheritAttrs: false,
      props: ['data', 'extraRender'] as any,
      setup(props, { slots, expose }) {
        expose({
          scrollTo: vi.fn(),
          getScrollInfo: () => ({ x: 0, y: 0 }),
          nativeElement: document.createElement('div'),
        })
        return () => {
          const list = props.data || []
          return createElement('div', { class: 'mock-virtual-list' }, [
            ...list.map((item: any, index: number) => slots.default?.({ item, index, style: {} })),
            // Mimic the `rowSpan` overlay lines the real virtual list renders.
            props.extraRender?.({
              start: 0,
              end: list.length - 1,
              offsetY: 0,
              getSize: () => ({ top: 0, bottom: 0 }),
            }),
          ])
        }
      },
    }),
  }
})

// No explicit `Table.EXPAND_COLUMN`: the expand column is auto inserted at index 0.
const columns = [
  { title: 'Name', dataIndex: 'name', key: 'name', width: 100 },
]

const data = [
  { key: '1', name: 'John' },
  { key: '2', name: 'Jim' },
]

describe('table expandable forceRender', () => {
  it('force renders expanded rows before expansion', async () => {
    const expandedRowRender = vi.fn((record: any) => h('div', { class: 'expanded-content' }, record.name))

    const wrapper = mount(Table, {
      props: {
        columns,
        data,
        expandable: { expandedRowRender, forceRender: true },
      },
    })

    const expandedRows = wrapper.findAll('.vc-table-expanded-row')

    expect(expandedRowRender).toHaveBeenCalledTimes(2)
    expect(expandedRowRender).toHaveBeenNthCalledWith(1, data[0], 0, 1, false)
    expect(expandedRowRender).toHaveBeenNthCalledWith(2, data[1], 1, 1, false)
    expect(expandedRows).toHaveLength(2)
    expect(expandedRows[0].attributes('style')).toContain('display: none')
    expect(expandedRows[1].attributes('style')).toContain('display: none')

    await wrapper.find('.vc-table-row-expand-icon').trigger('click')
    await nextTick()

    expect(wrapper.findAll('.vc-table-expanded-row')[0].attributes('style') || '').not.toContain('display: none')
    expect(wrapper.findAll('.vc-table-expanded-row')[1].attributes('style')).toContain('display: none')

    await wrapper.find('.vc-table-row-expand-icon').trigger('click')
    await nextTick()

    expect(wrapper.findAll('.vc-table-expanded-row')[0].attributes('style')).toContain('display: none')

    wrapper.unmount()
  })

  it('does not force render without the flag', () => {
    const expandedRowRender = vi.fn((record: any) => h('div', record.name))

    const wrapper = mount(Table, {
      props: {
        columns,
        data,
        expandable: { expandedRowRender },
      },
    })

    expect(expandedRowRender).not.toHaveBeenCalled()
    expect(wrapper.findAll('.vc-table-expanded-row')).toHaveLength(0)

    wrapper.unmount()
  })

  it('keeps force-rendered expanded content mounted across expand and collapse', async () => {
    const onMount = vi.fn()
    const onUnmount = vi.fn()

    const StatefulContent = defineComponent({
      name: 'StatefulContent',
      setup() {
        const count = ref(0)
        onMount()
        return {
          count,
          onUnmountHook: onUnmount,
        }
      },
      unmounted() {
        this.onUnmountHook()
      },
      render() {
        return h(
          'button',
          {
            type: 'button',
            class: 'stateful-expanded-content',
            onClick: () => {
              this.count += 1
            },
          },
          String(this.count),
        )
      },
    })

    const wrapper = mount(Table, {
      props: {
        columns,
        data: [data[0]],
        expandable: {
          expandedRowRender: () => h(StatefulContent),
          forceRender: true,
        },
      },
    })

    expect(onMount).toHaveBeenCalledTimes(1)
    expect(onUnmount).not.toHaveBeenCalled()

    const expandIcon = wrapper.find('.vc-table-row-expand-icon')

    await expandIcon.trigger('click')
    await wrapper.find('.stateful-expanded-content').trigger('click')
    await nextTick()
    expect(wrapper.find('.stateful-expanded-content').text()).toBe('1')

    // Collapse then expand again: the content instance must survive.
    await expandIcon.trigger('click')
    await nextTick()
    expect(onUnmount).not.toHaveBeenCalled()

    await expandIcon.trigger('click')
    await nextTick()
    expect(wrapper.find('.stateful-expanded-content').text()).toBe('1')
    expect(onMount).toHaveBeenCalledTimes(1)
    expect(onUnmount).not.toHaveBeenCalled()

    wrapper.unmount()
  })

  it('force renders expanded rows in a virtual table', async () => {
    const expandedRowRender = vi.fn((record: any) => h('div', { class: 'expanded-content' }, record.name))

    const wrapper = mount(VirtualTable, {
      props: {
        columns,
        data: [data[0]],
        scroll: { x: 100, y: 120 },
        listItemHeight: 20,
        expandable: { expandedRowRender, forceRender: true },
      },
    })
    await nextTick()

    expect(expandedRowRender).toHaveBeenCalledWith(data[0], 0, 1, false)
    expect(wrapper.find('.vc-table-expanded-row').attributes('style')).toContain('display: none')

    await wrapper.find('.vc-table-row-expand-icon').trigger('click')
    await nextTick()

    expect(wrapper.find('.vc-table-expanded-row').attributes('style') || '').not.toContain('display: none')

    wrapper.unmount()
  })

  it('does not duplicate force-rendered content for rowSpan overlay lines', async () => {
    const expandedRowRender = vi.fn((record: any) =>
      h('span', { 'data-expanded-record': record.name }, record.name))

    const wrapper = mount(VirtualTable, {
      props: {
        columns: [
          {
            dataIndex: 'name',
            key: 'name',
            width: 100,
            onCell: (_record: any, index = 0) => ({ rowSpan: index === 0 ? 2 : 0 }),
          },
        ],
        data,
        scroll: { x: 100, y: 120 },
        listItemHeight: 20,
        expandable: { expandedRowRender, forceRender: true },
      },
    })
    await nextTick()

    expect(wrapper.find('.vc-table-row-extra').exists()).toBe(true)
    expect(wrapper.findAll('[data-expanded-record="John"]')).toHaveLength(1)
    expect(wrapper.findAll('[data-expanded-record="Jim"]')).toHaveLength(1)

    wrapper.unmount()
  })
})
