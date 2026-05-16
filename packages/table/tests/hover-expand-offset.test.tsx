// @vitest-environment jsdom

import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { h, nextTick } from 'vue'
import Table from '../src'

describe('table hover with expandedRowOffset', () => {
  it('does not include expanded rows in rowSpan hover range', async () => {
    const columns = [
      {
        title: 'Team',
        dataIndex: 'team',
        key: 'team',
        onCell: (_record: any, index = 0) => index % 2 === 0 ? { rowSpan: 2 } : { rowSpan: 0 },
      },
      Table.EXPAND_COLUMN,
      { title: 'Name', dataIndex: 'name', key: 'name' },
      { title: 'Age', dataIndex: 'age', key: 'age' },
    ]
    const data = [
      { key: '1', team: 'Team A', name: 'John', age: 32, description: 'John details' },
      { key: '2', team: 'Team A', name: 'Jim', age: 42, description: 'Jim details' },
      { key: '3', team: 'Team B', name: 'Joe', age: 22, description: 'Joe details' },
      { key: '4', team: 'Team B', name: 'Jay', age: 28, description: 'Jay details' },
    ]

    const wrapper = mount(Table, {
      props: {
        columns,
        data,
        expandable: { defaultExpandedRowKeys: ['1'], expandedRowOffset: 3 },
      },
      slots: {
        expandedRowRender: ({ record }: any) => h('div', { class: 'expanded-content' }, record.description),
      },
    })

    const firstRow = wrapper.find('tbody tr[data-row-key="1"]')
    const thirdRow = wrapper.find('tbody tr[data-row-key="3"]')

    await firstRow.find('td').trigger('mouseenter')
    await nextTick()

    expect(firstRow.findAll('td').some(cell => cell.classes().includes('vc-table-cell-row-hover'))).toBe(true)
    expect(thirdRow.findAll('td').some(cell => cell.classes().includes('vc-table-cell-row-hover'))).toBe(false)

    wrapper.unmount()
  })

  it('does not hover previous offset cells when moving into the next grouped row', async () => {
    const columns = [
      {
        title: 'Team',
        dataIndex: 'team',
        key: 'team',
        onCell: (_record: any, index = 0) => index % 2 === 0 ? { rowSpan: 2 } : { rowSpan: 0 },
      },
      Table.EXPAND_COLUMN,
      { title: 'Name', dataIndex: 'name', key: 'name' },
      { title: 'Age', dataIndex: 'age', key: 'age' },
      { title: 'Address', dataIndex: 'address', key: 'address' },
    ]
    const data = [
      { key: '1', team: 'Team A', name: 'John Brown', age: 32, address: 'New York No. 1 Lake Park', description: 'John details' },
      { key: '2', team: 'Team A', name: 'Jim Green', age: 42, address: 'London No. 1 Lake Park', description: 'Jim details' },
      { key: '3', team: 'Team B', name: 'Not Expandable', age: 29, address: 'Jiangsu No. 1 Lake Park', description: 'This not expandable' },
      { key: '4', team: 'Team B', name: 'Joe Black', age: 32, address: 'Sydney No. 1 Lake Park', description: 'Joe details' },
    ]

    const wrapper = mount(Table, {
      props: {
        columns,
        data,
        expandable: { defaultExpandedRowKeys: ['1', '2', '3', '4'], expandedRowOffset: 3 },
      },
      slots: {
        expandedRowRender: ({ record }: any) => h('div', { class: 'expanded-content' }, record.description),
      },
    })

    const allBodyCells = wrapper.findAll('tbody td')
    const teamACell = allBodyCells.find(cell => cell.text() === 'Team A')
    const jimNameCell = allBodyCells.find(cell => cell.text() === 'Jim Green')
    const notExpandableAgeCell = allBodyCells.find(cell => cell.text() === '29')

    expect(teamACell).toBeTruthy()
    expect(jimNameCell).toBeTruthy()
    expect(notExpandableAgeCell).toBeTruthy()

    await notExpandableAgeCell!.trigger('mouseenter')
    await nextTick()

    expect(notExpandableAgeCell!.classes()).toContain('vc-table-cell-row-hover')
    expect(teamACell!.classes()).not.toContain('vc-table-cell-row-hover')
    expect(jimNameCell!.classes()).not.toContain('vc-table-cell-row-hover')

    wrapper.unmount()
  })
})
