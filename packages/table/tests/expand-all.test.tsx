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
      'class': `custom-expand-${props.type}`,
      'data-record-key': props.record?.key,
      'onClick': props.onClick,
    })
    const wrapper = mount(Table, {
      props: {
        columns: [{ title: 'Name', dataIndex: 'name' }],
        components: { ExpandIcon },
        data: [{ key: '1', name: 'First' }],
        expandable: {
          showExpandAll: true,
          expandedRowRender: () => 'Details',
          expandIcon: () => h('span', { class: 'legacy-expand-icon' }),
        },
      },
    })

    expect(wrapper.find('.custom-expand-all').exists()).toBe(true)
    expect(wrapper.find('.custom-expand-all').attributes('data-record-key')).toBeUndefined()
    expect(wrapper.find('.custom-expand-row').exists()).toBe(true)
    expect(wrapper.find('.custom-expand-row').attributes('data-record-key')).toBe('1')
    expect(wrapper.find('.legacy-expand-icon').exists()).toBe(false)
    wrapper.unmount()
  })

  it('only renders the default expand-all control when enabled', async () => {
    const wrapper = mount(Table, {
      props: {
        columns: [{ title: 'Name', dataIndex: 'name' }],
        data: [{ key: '1', name: 'First' }],
        expandable: { expandedRowRender: () => 'Details' },
      },
    })

    expect(wrapper.find('thead .vc-table-row-expand-icon').exists()).toBe(false)

    await wrapper.setProps({
      expandable: { showExpandAll: true, expandedRowRender: () => 'Details' },
    })

    const control = wrapper.find('thead button.vc-table-row-expand-icon')
    expect(control.attributes('type')).toBe('button')
    expect(control.attributes('aria-expanded')).toBe('false')
    expect(control.attributes('aria-label')).toBe('Expand all rows')

    await control.trigger('click')
    expect(control.attributes('aria-expanded')).toBe('true')
    expect(control.attributes('aria-label')).toBe('Collapse all rows')
    wrapper.unmount()
  })

  it('does nothing when no rows are expandable', async () => {
    const onExpandAll = vi.fn()
    const onExpandedRowsChange = vi.fn()
    const wrapper = mount(Table, {
      props: {
        columns: [{ title: 'Name', dataIndex: 'name' }],
        data: [{ key: '1', name: 'First' }],
        components: {
          ExpandIcon: (props: any) => props.type === 'all'
            ? h('button', {
                'class': 'custom-expand-all',
                'data-expandable': props.expandable,
                'onClick': props.onClick,
              })
            : null,
        },
        expandable: {
          showExpandAll: true,
          expandedRowRender: () => 'Details',
          rowExpandable: () => false,
          onExpandAll,
          onExpandedRowsChange,
        },
      },
    })

    const control = wrapper.find('.custom-expand-all')
    expect(control.attributes('data-expandable')).toBe('false')
    await control.trigger('click')
    expect(onExpandAll).not.toHaveBeenCalled()
    expect(onExpandedRowsChange).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('preserves unrelated keys with controlled expandedRowKeys', async () => {
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
          expandedRowKeys: ['unrelated'],
          expandedRowRender: () => 'Details',
          onExpandedRowsChange,
        },
      },
    })

    const control = wrapper.find('thead button')
    await control.trigger('click')
    expect(onExpandedRowsChange).toHaveBeenLastCalledWith(['unrelated', '1', '2'])
    expect(control.attributes('aria-expanded')).toBe('false')

    await wrapper.setProps({
      expandable: {
        showExpandAll: true,
        expandedRowKeys: ['unrelated', '1', '2'],
        expandedRowRender: () => 'Details',
        onExpandedRowsChange,
      },
    })
    expect(control.attributes('aria-expanded')).toBe('true')

    await control.trigger('click')
    expect(onExpandedRowsChange).toHaveBeenLastCalledWith(['unrelated'])
    wrapper.unmount()
  })
})
