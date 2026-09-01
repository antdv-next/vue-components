import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import Tree from '../src'

describe('tree', () => {
  it('preserves drag text set by consumers', async () => {
    const dragData = new Map<string, string>()
    const dataTransfer = {
      setData: (type: string, value: string) => dragData.set(type, value),
    }
    const wrapper = mount(Tree, {
      props: {
        draggable: true,
        treeData: [{ key: '0', title: 'node' }] as any,
        onDragStart: ({ event }) => event.dataTransfer?.setData('text/plain', 'custom drag text'),
      },
    })

    const event = new Event('dragstart', { bubbles: true })
    Object.defineProperty(event, 'dataTransfer', { value: dataTransfer })
    wrapper.get('.vc-tree-node-content-wrapper').element.dispatchEvent(event)

    expect(dragData.get('text/plain')).toBe('custom drag text')
  })

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

  it.each([
    { description: 'a selected node', treeProps: { selectedKeys: ['1'] } },
    { description: 'selection disabled', treeProps: { selectable: false } },
  ])('does not activate when a title descendant receives focus with $description', async ({ treeProps }) => {
    const onActiveChange = vi.fn()
    const onFocus = vi.fn()
    const wrapper = mount(() => (
      <Tree
        treeData={Array.from({ length: 20 }, (_, index) => ({
          key: String(index),
          title: `Node ${index}`,
        })) as any}
        height={100}
        itemHeight={20}
        titleRender={node => node.key === '0'
          ? <select aria-label="Node action"><option>Action</option></select>
          : node.title}
        onActiveChange={onActiveChange}
        onFocus={onFocus}
        {...treeProps}
      />
    ))

    const select = wrapper.get('select')
    await select.trigger('mousedown')
    window.dispatchEvent(new MouseEvent('mouseup'))
    select.element.dispatchEvent(new FocusEvent('focus', { bubbles: true }))

    expect(onFocus).toHaveBeenCalledTimes(1)
    expect(onActiveChange).not.toHaveBeenCalled()
  })
})
