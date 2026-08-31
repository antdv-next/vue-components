// @vitest-environment jsdom

import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { h } from 'vue'
import Table from '../src'

describe('table expand all', () => {
  it('expands and collapses every expandable row from the column header', async () => {
    const onExpandAll = vi.fn()
    const onExpandedRowsChange = vi.fn()
    const wrapper = mount(Table, {
      props: {
        columns: [{ title: 'Name', dataIndex: 'name' }],
        data: [
          { key: '1', name: 'First' },
          { key: '2', name: 'Second' },
        ],
        expandable: {
          showExpandAll: true,
          rowExpandable: (record: any) => record.key === '1',
          expandedRowRender: (record: any) => h('div', `Details for ${record.name}`),
          columnTitle: ({ expandIcon }: any) => h('div', { class: 'expand-all-title' }, [expandIcon]),
          onExpandAll,
          onExpandedRowsChange,
        },
      },
    })

    const expandAll = wrapper.find('thead button[aria-label="Expand all rows"]')
    expect(expandAll.exists()).toBe(true)

    await expandAll.trigger('click')
    expect(wrapper.findAll('.vc-table-expanded-row')).toHaveLength(1)
    expect(wrapper.find('thead button').attributes('aria-expanded')).toBe('true')
    expect(onExpandAll).toHaveBeenLastCalledWith(true)
    expect(onExpandedRowsChange).toHaveBeenLastCalledWith(['1'])

    await wrapper.find('thead button').trigger('click')
    expect(wrapper.find('.vc-table-expanded-row').attributes('style')).toContain('display: none')
    expect(onExpandAll).toHaveBeenLastCalledWith(false)
    expect(onExpandedRowsChange).toHaveBeenLastCalledWith([])

    wrapper.unmount()
  })

  it('uses components.ExpandIcon for row and expand-all controls', () => {
    const ExpandIcon = (props: any) => h('button', {
      class: `custom-expand-${props.type}`,
      onClick: props.onClick,
    })
    const wrapper = mount(Table, {
      props: {
        columns: [{ title: 'Name', dataIndex: 'name' }],
        components: { ExpandIcon },
        data: [{ key: '1', name: 'First' }],
        expandable: {
          showExpandAll: true,
          expandedRowRender: () => 'Details',
        },
      },
    })

    expect(wrapper.find('.custom-expand-all').exists()).toBe(true)
    expect(wrapper.find('.custom-expand-row').exists()).toBe(true)
    wrapper.unmount()
  })
})
