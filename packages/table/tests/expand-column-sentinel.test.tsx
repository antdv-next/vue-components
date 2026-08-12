// @vitest-environment jsdom

import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, h, reactive, ref } from 'vue'
import Table from '../src'

// `Table.EXPAND_COLUMN` is a sentinel matched by reference. A deep reactive `columns`
// source (component props, `reactive()`, `ref()`) hands every entry out as a proxy, so
// the sentinel must be unwrapped before it is compared.
function makeColumns() {
  return [
    { title: 'Team', dataIndex: 'team', key: 'team' },
    Table.EXPAND_COLUMN,
    { title: 'Name', dataIndex: 'name', key: 'name' },
  ]
}

const data = [
  { key: '1', team: 'Team A', name: 'John', description: 'John details' },
  { key: '2', team: 'Team A', name: 'Jim', description: 'Jim details' },
]

const expandable = {
  defaultExpandedRowKeys: ['1'],
  expandedRowRender: (record: any) => h('div', { class: 'expanded-content' }, record.description),
}

function expectSentinelHonoured(wrapper: any) {
  // Exactly one expand column, at the position the sentinel was placed (index 1):
  // no column auto inserted at index 0 and no phantom column left behind.
  expect(wrapper.findAll('thead th').map((th: any) => th.text())).toEqual(['Team', '', 'Name'])
  expect(wrapper.findAll('colgroup col.vc-table-expand-icon-col')).toHaveLength(1)

  const firstRow = wrapper.find('tbody tr[data-row-key="1"]')
  const cells = firstRow.findAll('td')
  expect(cells).toHaveLength(3)
  expect(cells.map((td: any) => td.text())).toEqual(['Team A', '', 'John'])
  expect(cells[1].classes()).toContain('vc-table-row-expand-icon-cell')
  expect(wrapper.findAll('.vc-table-row-expand-icon')).toHaveLength(2)
}

describe('table EXPAND_COLUMN sentinel identity', () => {
  it('honours the sentinel when `columns` arrives through component props', () => {
    const wrapper = mount(Table, {
      props: { columns: makeColumns(), data, expandable },
    })

    expectSentinelHonoured(wrapper)

    wrapper.unmount()
  })

  it('honours the sentinel when `columns` is a `reactive()` array', () => {
    const columns = reactive(makeColumns())
    const App = defineComponent({
      setup() {
        return () => h(Table as any, { columns, data, expandable })
      },
    })

    const wrapper = mount(App)

    expectSentinelHonoured(wrapper)

    wrapper.unmount()
  })

  it('honours the sentinel when `columns` is a deep `ref()` array', () => {
    const columns = ref(makeColumns())
    const App = defineComponent({
      setup() {
        return () => h(Table as any, { columns: columns.value, data, expandable })
      },
    })

    const wrapper = mount(App)

    expectSentinelHonoured(wrapper)

    wrapper.unmount()
  })

  it('drops the sentinel from a reactive `columns` when `expandable` is not configured', () => {
    const columns = reactive(makeColumns())
    const App = defineComponent({
      setup() {
        return () => h(Table as any, { columns, data })
      },
    })

    const wrapper = mount(App)

    expect(wrapper.findAll('thead th').map(th => th.text())).toEqual(['Team', 'Name'])
    expect(wrapper.find('tbody tr[data-row-key="1"]').findAll('td')).toHaveLength(2)

    wrapper.unmount()
  })
})
