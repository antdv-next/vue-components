// @vitest-environment jsdom

import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick, reactive } from 'vue'
import Table from '../src'

describe('cell render memoization', () => {
  let renderSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    renderSpy = vi.fn((value: any) => value)
  })

  function makeColumns() {
    return [
      { title: 'A', dataIndex: 'a', key: 'a', render: (value: any) => renderSpy(value) },
      { title: 'B', dataIndex: 'b', key: 'b' },
    ]
  }

  it('does not re-run `render` when an unrelated re-render keeps the same records', async () => {
    const row1 = { key: '1', a: 'a1', b: 'b1' }
    const row2 = { key: '2', a: 'a2', b: 'b2' }

    const wrapper = mount(Table, {
      props: { columns: makeColumns(), data: [row1, row2] },
    })
    await nextTick()

    // One call per row for the `a` column on the initial render.
    expect(renderSpy).toHaveBeenCalledTimes(2)

    // A new data array but the SAME record references: simulates an ancestor
    // re-render (e.g. table `loading` toggle) that should not touch the body.
    await wrapper.setProps({ data: [row1, row2] })
    await nextTick()
    expect(renderSpy).toHaveBeenCalledTimes(2)

    // An unrelated prop change forcing a parent re-render must not re-run render.
    await wrapper.setProps({ class: 'changed' } as any)
    await nextTick()
    expect(renderSpy).toHaveBeenCalledTimes(2)
  })

  it('re-runs `render` only for the records that actually changed', async () => {
    const row1 = { key: '1', a: 'a1', b: 'b1' }
    const row2 = { key: '2', a: 'a2', b: 'b2' }

    const wrapper = mount(Table, {
      props: { columns: makeColumns(), data: [row1, row2] },
    })
    await nextTick()
    expect(renderSpy).toHaveBeenCalledTimes(2)

    // Replace only row2 with a new record reference.
    await wrapper.setProps({ data: [row1, { key: '2', a: 'a2-next', b: 'b2' }] })
    await nextTick()

    // Only the changed row should re-run; row1 stays memoized.
    expect(renderSpy).toHaveBeenCalledTimes(3)
    expect(renderSpy).toHaveBeenLastCalledWith('a2-next')
  })

  it('memoizes the `bodyCell` slot the same way', async () => {
    const bodyCell = vi.fn(({ text }: any) => text)
    const row1 = { key: '1', a: 'a1', b: 'b1' }
    const row2 = { key: '2', a: 'a2', b: 'b2' }

    const wrapper = mount(Table, {
      props: {
        columns: [{ title: 'A', dataIndex: 'a', key: 'a' }],
        data: [row1, row2],
        bodyCell,
      },
    })
    await nextTick()
    const initial = bodyCell.mock.calls.length
    expect(initial).toBeGreaterThan(0)

    // Unrelated re-render with stable records: bodyCell must not be called again.
    await wrapper.setProps({ class: 'changed' } as any)
    await nextTick()
    expect(bodyCell.mock.calls.length).toBe(initial)
  })

  it('honors `shouldCellUpdate` to skip updates even when the record changes', async () => {
    const columns = [
      {
        title: 'A',
        dataIndex: 'a',
        key: 'a',
        render: (value: any) => renderSpy(value),
        // Only update when `a` changes; ignore changes to other fields.
        shouldCellUpdate: (record: any, prev: any) => record.a !== prev.a,
      },
    ]
    const wrapper = mount(Table, {
      props: { columns, data: [{ key: '1', a: 'a1', b: 'b1' }] },
    })
    await nextTick()
    expect(renderSpy).toHaveBeenCalledTimes(1)

    // Change only `b`: shouldCellUpdate returns false -> render is skipped.
    await wrapper.setProps({ data: [{ key: '1', a: 'a1', b: 'b2' }] })
    await nextTick()
    expect(renderSpy).toHaveBeenCalledTimes(1)

    // Change `a`: shouldCellUpdate returns true -> render runs again.
    await wrapper.setProps({ data: [{ key: '1', a: 'a2', b: 'b2' }] })
    await nextTick()
    expect(renderSpy).toHaveBeenCalledTimes(2)
    expect(renderSpy).toHaveBeenLastCalledWith('a2')
  })

  it('updates a cell when its record is mutated in place (reactive data)', async () => {
    const data = reactive([
      { key: '1', a: 'a1', b: 'b1' },
      { key: '2', a: 'a2', b: 'b2' },
    ])

    const wrapper = mount(Table, {
      props: { columns: makeColumns(), data },
    })
    await nextTick()
    expect(renderSpy).toHaveBeenCalledTimes(2)

    // In-place mutation of a reactive record must re-render that cell.
    data[0].a = 'a1-next'
    await nextTick()
    expect(renderSpy).toHaveBeenCalledTimes(3)
    expect(renderSpy).toHaveBeenLastCalledWith('a1-next')

    const firstRowCell = wrapper.find('tbody tr[data-row-key="1"] td')
    expect(firstRowCell.text()).toBe('a1-next')
  })

  it('renders newly added rows and stops rendering removed ones', async () => {
    const row1 = { key: '1', a: 'a1', b: 'b1' }
    const row2 = { key: '2', a: 'a2', b: 'b2' }

    const wrapper = mount(Table, {
      props: { columns: makeColumns(), data: [row1] },
    })
    await nextTick()
    expect(renderSpy).toHaveBeenCalledTimes(1)

    // Add a row -> only the new row renders; existing row stays memoized.
    await wrapper.setProps({ data: [row1, row2] })
    await nextTick()
    expect(renderSpy).toHaveBeenCalledTimes(2)
    expect(renderSpy).toHaveBeenLastCalledWith('a2')

    // Remove the last row -> the remaining row keeps its index and stays
    // memoized (no extra render).
    await wrapper.setProps({ data: [row1] })
    await nextTick()
    expect(renderSpy).toHaveBeenCalledTimes(2)
    expect(wrapper.findAll('tbody tr')).toHaveLength(1)
    expect(wrapper.find('tbody tr[data-row-key="1"] td').text()).toBe('a1')
  })

  it('picks up a new column `render` function at runtime', async () => {
    const row1 = { key: '1', a: 'a1', b: 'b1' }
    const wrapper = mount(Table, {
      props: {
        columns: [{ title: 'A', dataIndex: 'a', key: 'a', render: () => 'first' }],
        data: [row1],
      },
    })
    await nextTick()
    expect(wrapper.find('tbody td').text()).toBe('first')

    await wrapper.setProps({
      columns: [{ title: 'A', dataIndex: 'a', key: 'a', render: () => 'second' }],
    })
    await nextTick()
    expect(wrapper.find('tbody td').text()).toBe('second')
  })

  it('toggles hover state without re-running `render`', async () => {
    const wrapper = mount(Table, {
      props: {
        columns: makeColumns(),
        data: [{ key: '1', a: 'a1', b: 'b1' }],
      },
    })
    await nextTick()
    const initial = renderSpy.mock.calls.length

    const cell = wrapper.find('tbody tr[data-row-key="1"] td')
    await cell.trigger('mouseenter')
    await nextTick()

    // Hover only mutates the wrapper class, never the memoized child content.
    expect(cell.classes()).toContain('vc-table-cell-row-hover')
    expect(renderSpy.mock.calls.length).toBe(initial)

    await cell.trigger('mouseleave')
    await nextTick()
    expect(cell.classes()).not.toContain('vc-table-cell-row-hover')
    expect(renderSpy.mock.calls.length).toBe(initial)
  })
})
