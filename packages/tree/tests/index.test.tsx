import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import Tree from '../src'

describe('tree', () => {
  it('supports switcher semantic styles and class names', () => {
    const wrapper = mount(() => (
      <Tree
        treeData={[
          {
            key: '0',
            title: 'parent',
            children: [{ key: '0-0', title: 'child' }],
          },
        ] as any}
        classNames={{
          item: 'test-item',
          itemIcon: 'test-icon',
          itemTitle: 'test-title',
          itemSwitcher: 'test-switcher',
        }}
        styles={{
          item: { background: 'red' },
          itemIcon: { color: 'blue' },
          itemTitle: { color: 'yellow' },
          itemSwitcher: { width: '32px' },
        }}
      />
    ))

    const switcher = wrapper.get('.vc-tree-switcher')
    expect(switcher.classes()).toContain('test-switcher')
    expect((switcher.element as HTMLElement).style.width).toBe('32px')
  })

  it('does not activate a node when tree receives focus from mouse', async () => {
    const onActiveChange = vi.fn()
    const onMouseDown = vi.fn()

    const wrapper = mount(() => (
      <Tree
        treeData={[
          { key: '0', title: '0' },
          { key: '1', title: '1' },
          { key: '2', title: '2' },
        ] as any}
        height={100}
        itemHeight={24}
        onActiveChange={onActiveChange}
        onMouseDown={onMouseDown}
      />
    ))

    const treeList = wrapper.get('.vc-tree-list')
    await treeList.trigger('mousedown')
    await treeList.trigger('focus')
    window.dispatchEvent(new MouseEvent('mouseup'))

    expect(onMouseDown).toHaveBeenCalledTimes(1)
    expect(onActiveChange).not.toHaveBeenCalled()
  })
})
