// @vitest-environment jsdom

import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { VirtualTable } from '../src'

// Render every row so the cell memo can be exercised without real windowing.
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

describe('virtual table cell render memoization', () => {
  let renderSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    renderSpy = vi.fn((value: any) => value)
  })

  function makeColumns() {
    return [
      { title: 'A', dataIndex: 'a', key: 'a', width: 100, render: (value: any) => renderSpy(value) },
      { title: 'B', dataIndex: 'b', key: 'b', width: 100 },
    ]
  }

  const baseProps = () => ({
    columns: makeColumns(),
    scroll: { x: 200, y: 120 },
    listItemHeight: 20,
  })

  it('does not re-run `render` on an unrelated re-render with stable records', async () => {
    const row1 = { key: '1', a: 'a1', b: 'b1' }
    const row2 = { key: '2', a: 'a2', b: 'b2' }

    const wrapper = mount(VirtualTable, {
      props: { ...baseProps(), data: [row1, row2] },
    })
    await nextTick()
    const initial = renderSpy.mock.calls.length
    expect(initial).toBeGreaterThan(0)

    // Same records, new array reference (simulates a `loading` toggle upstream).
    await wrapper.setProps({ data: [row1, row2] })
    await nextTick()
    expect(renderSpy.mock.calls.length).toBe(initial)

    await wrapper.setProps({ class: 'changed' } as any)
    await nextTick()
    expect(renderSpy.mock.calls.length).toBe(initial)
  })

  it('re-runs `render` only for the changed record', async () => {
    const row1 = { key: '1', a: 'a1', b: 'b1' }
    const row2 = { key: '2', a: 'a2', b: 'b2' }

    const wrapper = mount(VirtualTable, {
      props: { ...baseProps(), data: [row1, row2] },
    })
    await nextTick()
    const initial = renderSpy.mock.calls.length

    await wrapper.setProps({ data: [row1, { key: '2', a: 'a2-next', b: 'b2' }] })
    await nextTick()

    expect(renderSpy.mock.calls.length).toBe(initial + 1)
    expect(renderSpy).toHaveBeenLastCalledWith('a2-next')
  })

  it('honors `shouldCellUpdate` in a virtual table', async () => {
    const columns = [
      {
        title: 'A',
        dataIndex: 'a',
        key: 'a',
        width: 100,
        render: (value: any) => renderSpy(value),
        shouldCellUpdate: (record: any, prev: any) => record.a !== prev.a,
      },
    ]
    const wrapper = mount(VirtualTable, {
      props: {
        columns,
        scroll: { x: 100, y: 120 },
        listItemHeight: 20,
        data: [{ key: '1', a: 'a1', b: 'b1' }],
      },
    })
    await nextTick()
    expect(renderSpy).toHaveBeenCalledTimes(1)

    // Only `b` changes -> skipped.
    await wrapper.setProps({ data: [{ key: '1', a: 'a1', b: 'b2' }] })
    await nextTick()
    expect(renderSpy).toHaveBeenCalledTimes(1)

    // `a` changes -> render runs.
    await wrapper.setProps({ data: [{ key: '1', a: 'a2', b: 'b2' }] })
    await nextTick()
    expect(renderSpy).toHaveBeenCalledTimes(2)
    expect(renderSpy).toHaveBeenLastCalledWith('a2')
  })
})
