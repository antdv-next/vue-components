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
        expandable: {
          defaultExpandedRowKeys: ['1'],
          expandedRowOffset: 3,
          expandedRowRender: record => h('div', { class: 'expanded-content' }, record.description),
        },
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
        expandable: {
          defaultExpandedRowKeys: ['1', '2', '3', '4'],
          expandedRowOffset: 3,
          expandedRowRender: record => h('div', { class: 'expanded-content' }, record.description),
        },
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

  it('uses legacy render rowSpan for the hover range', async () => {
    const columns = [
      Table.EXPAND_COLUMN,
      {
        title: 'Team',
        dataIndex: 'team',
        key: 'team',
        render: (value: string, _record: any, index: number) => ({
          children: value,
          props: { rowSpan: index % 2 === 0 ? 2 : 0 },
        }),
      },
      { title: 'Name', dataIndex: 'name', key: 'name' },
    ]
    const data = [
      { key: '1', team: 'Team A', name: 'John' },
      { key: '2', team: 'Team A', name: 'Jim' },
    ]

    const wrapper = mount(Table, {
      props: {
        columns,
        data,
        expandable: {
          expandedRowOffset: 2,
          expandedRowRender: record => h('div', record.name),
        },
      },
    })

    const firstRow = wrapper.find('tbody tr[data-row-key="1"]')
    const secondRow = wrapper.find('tbody tr[data-row-key="2"]')
    const teamCell = firstRow.findAll('td').find(cell => cell.text() === 'Team A')

    expect(teamCell).toBeTruthy()
    expect(teamCell!.attributes('rowspan')).toBe('2')

    await teamCell!.trigger('mouseenter')
    await nextTick()

    expect(secondRow.findAll('td').some(cell => cell.classes().includes('vc-table-cell-row-hover'))).toBe(true)

    wrapper.unmount()
  })

  it('does not mutate the object returned by `onCell`', async () => {
    const rowSpanProps: any[] = [{ rowSpan: 2 }, { rowSpan: 0 }, {}]
    const columns = [
      {
        title: 'Group',
        dataIndex: 'group',
        key: 'group',
        onCell: (_record: any, index = 0) => rowSpanProps[index],
      },
      { title: 'Name', dataIndex: 'name', key: 'name' },
    ]
    const data = [
      { key: 'a', group: 'Group 1', name: 'Alpha' },
      { key: 'b', group: 'Group 1', name: 'Beta' },
      { key: 'c', group: 'Group 2', name: 'Gamma' },
    ]
    // The expand column is auto inserted at index 0, so `group` sits at index 1
    // and needs an offset of 2 to be covered.
    const expandable = (expandedRowKeys: string[]) => ({
      expandedRowOffset: 2,
      expandedRowKeys,
      expandedRowRender: (record: any) => h('div', record.name),
    })

    const wrapper = mount(Table, {
      props: { columns, data, expandable: expandable([]) },
    })

    const getGroupCell = () => wrapper.findAll('tbody td').find(cell => cell.text() === 'Group 1')!

    expect(rowSpanProps[0].rowSpan).toBe(2)
    expect(getGroupCell().attributes('rowspan')).toBe('2')

    await wrapper.setProps({ expandable: expandable(['a']) } as any)
    await nextTick()

    expect(rowSpanProps[0].rowSpan).toBe(2)
    expect(getGroupCell().attributes('rowspan')).toBe('3')

    await wrapper.setProps({ expandable: expandable([]) } as any)
    await nextTick()

    expect(rowSpanProps[0].rowSpan).toBe(2)
    expect(getGroupCell().attributes('rowspan')).toBe('2')

    wrapper.unmount()
  })
})
