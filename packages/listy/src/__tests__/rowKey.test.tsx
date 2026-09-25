import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { h, nextTick } from 'vue'
import Listy from '../List'

// Group `A` items are not contiguous, so grouping reorders the rendered rows.
const items = [
  { name: 'foo', group: 'A' },
  { name: 'bar', group: 'B' },
  { name: 'baz', group: 'A' },
]

describe('rowKey', () => {
  it.each([true, false])('calls rowKey with the item and its index (virtual: %s)', async (virtual) => {
    const rowKey = vi.fn((item: { name: string }) => item.name)
    const wrapper = mount(Listy, {
      props: {
        items,
        rowKey,
        virtual,
        height: 200,
        itemHeight: 20,
        itemRender: (item: { name: string }) => h('span', item.name),
      },
    })
    await nextTick()

    expect(wrapper.text()).toContain('foo')
    expect(rowKey).toHaveBeenCalledWith(items[0], 0)
    expect(rowKey).toHaveBeenCalledWith(items[1], 1)
    expect(rowKey).toHaveBeenCalledWith(items[2], 2)
  })

  it.each([true, false])('passes the original index when groups reorder rows (virtual: %s)', async (virtual) => {
    const rowKey = vi.fn((_item: { name: string }, index: number) => `row-${index}`)
    const wrapper = mount(Listy, {
      props: {
        items,
        rowKey,
        virtual,
        height: 200,
        itemHeight: 20,
        group: {
          key: 'group',
          title: (key: string) => h('span', key),
        },
        itemRender: (item: { name: string }) => h('span', item.name),
      },
    })
    await nextTick()

    expect(wrapper.text()).toContain('baz')
    expect(rowKey).toHaveBeenCalledWith(items[2], 2)
    expect(rowKey).not.toHaveBeenCalledWith(items[2], 1)
  })
})
