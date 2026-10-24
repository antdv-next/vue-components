// @vitest-environment jsdom

import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { VirtualTable } from '../src'

// Render every row so the row hover state can be exercised without real windowing.
vi.mock('@v-c/virtual-list', async () => {
  const { defineComponent, h } = await import('vue')
  return {
    default: defineComponent({
      name: 'VirtualList',
      inheritAttrs: false,
      props: ['data'] as any,
      setup(props, { slots, expose }) {
        expose({
          scrollTo: vi.fn(),
          getScrollInfo: () => ({ x: 0, y: 0 }),
          nativeElement: document.createElement('div'),
        })
        return () =>
          h('div', { class: 'mock-virtual-list' }, (props.data || []).map((item: any, index: number) =>
            slots.default?.({ item, index, style: {} })))
      },
    }),
  }
})

describe('virtual table row hover', () => {
  function mountTable() {
    const columns = [
      {
        title: 'Team',
        dataIndex: 'team',
        key: 'team',
        width: 100,
        onCell: (_record: any, index = 0) => index % 2 === 0 ? { rowSpan: 2 } : { rowSpan: 0 },
      },
      { title: 'Name', dataIndex: 'name', key: 'name', width: 100 },
      { title: 'Age', dataIndex: 'age', key: 'age', width: 100 },
    ]
    const data = [
      { key: '1', team: 'Team A', name: 'John', age: 32 },
      { key: '2', team: 'Team A', name: 'Jim', age: 42 },
      { key: '3', team: 'Team B', name: 'Joe', age: 22 },
    ]

    return mount(VirtualTable, {
      props: { columns, data, scroll: { x: 300, y: 120 }, listItemHeight: 20 },
    })
  }

  it('marks every cell of the hovered row, not only rowSpan cells', async () => {
    const wrapper = mountTable()
    await nextTick()

    const firstRow = wrapper.find('[data-row-key="1"]')
    const secondRow = wrapper.find('[data-row-key="2"]')
    const nameCell = firstRow.findAll('.vc-table-cell').find(cell => cell.text() === 'John')

    expect(nameCell).toBeTruthy()

    await nameCell!.trigger('mouseenter')
    await nextTick()

    expect(firstRow.findAll('.vc-table-cell').every(cell => cell.classes().includes('vc-table-cell-row-hover'))).toBe(true)
    expect(secondRow.findAll('.vc-table-cell').some(cell => cell.classes().includes('vc-table-cell-row-hover'))).toBe(false)

    wrapper.unmount()
  })

  it('keeps the rowSpan cell hovered while the pointer moves through its range', async () => {
    const wrapper = mountTable()
    await nextTick()

    const firstRow = wrapper.find('[data-row-key="1"]')
    const secondRow = wrapper.find('[data-row-key="2"]')
    const firstRowCells = firstRow.findAll('.vc-table-cell')
    const spanCell = firstRowCells[0]
    const firstRowNameCell = firstRowCells.find(cell => cell.text() === 'John')!
    const secondRowNameCell = secondRow.findAll('.vc-table-cell').find(cell => cell.text() === 'Jim')!

    await secondRowNameCell.trigger('mouseenter')
    await nextTick()

    expect(secondRowNameCell.classes()).toContain('vc-table-cell-row-hover')
    expect(spanCell.classes()).toContain('vc-table-cell-row-hover')
    expect(firstRowNameCell.classes()).not.toContain('vc-table-cell-row-hover')

    wrapper.unmount()
  })
})
