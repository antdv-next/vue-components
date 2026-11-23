import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import Tree from '../src'

const treeData = [
  {
    key: 'parent',
    title: 'parent',
    children: [{ key: 'child', title: 'child' }],
  },
]

function visibleNodes(wrapper: ReturnType<typeof mount>) {
  return wrapper.findAll('.vc-tree-treenode[role="treeitem"]').length
}

describe('tree controlled expandedKeys', () => {
  it('expands on click when uncontrolled', async () => {
    const wrapper = mount(() => <Tree treeData={treeData as any} />)
    expect(visibleNodes(wrapper)).toBe(1)

    await wrapper.get('.vc-tree-switcher').trigger('click')

    expect(visibleNodes(wrapper)).toBe(2)
  })

  it('keeps a controlled tree collapsed when the parent ignores onExpand', async () => {
    const onExpand = vi.fn()
    // The parent never reacts to `onExpand`, so `expandedKeys` stays `[]`.
    const wrapper = mount(() => (
      <Tree treeData={treeData as any} expandedKeys={[]} onExpand={onExpand} />
    ))
    expect(visibleNodes(wrapper)).toBe(1)

    await wrapper.get('.vc-tree-switcher').trigger('click')

    expect(onExpand).toHaveBeenCalledWith(['parent'], expect.objectContaining({ expanded: true }))
    expect(visibleNodes(wrapper)).toBe(1)
  })

  it('keeps a controlled node expanded when loadData rejects', async () => {
    const onExpand = vi.fn()
    const loadData = vi.fn(() => Promise.reject(new Error('nope')))
    const wrapper = mount(() => (
      <Tree
        treeData={[{ key: 'parent', title: 'parent' }] as any}
        expandedKeys={['parent']}
        loadData={loadData as any}
        onExpand={onExpand}
      />
    ))

    // Collapse then re-expand so `onNodeExpand` runs the `loadData` branch.
    await wrapper.get('.vc-tree-switcher').trigger('click')
    await wrapper.get('.vc-tree-switcher').trigger('click')
    await Promise.resolve()
    await nextTick()

    expect(loadData).toHaveBeenCalled()
    // The rollback cannot write `expandedKeys`, so the parent keeps it open.
    expect(wrapper.get('.vc-tree-switcher').classes()).toContain('vc-tree-switcher_open')
  })

  it('keeps a controlled expanded node expanded on dragstart', async () => {
    const wrapper = mount(() => (
      <Tree treeData={treeData as any} expandedKeys={['parent']} draggable />
    ))
    expect(visibleNodes(wrapper)).toBe(2)

    await wrapper
      .get('.vc-tree-treenode[role="treeitem"] .vc-tree-node-content-wrapper')
      .trigger('dragstart')

    expect(visibleNodes(wrapper)).toBe(2)
  })

  it('matches upstream: scrollTo autoExpand is a no-op when controlled', async () => {
    // Guarded at the call site — see `scroll-to.test.tsx` for the full pair.
    const wrapper = mount({
      render: () => <Tree treeData={treeData as any} expandedKeys={[]} ref="tree" />,
    })

    ;(wrapper.vm.$refs.tree as any).scrollTo({ key: 'parent', autoExpand: true })
    await nextTick()

    expect(visibleNodes(wrapper)).toBe(1)
  })
})

/**
 * react-component/tree#1069: `undefined` means uncontrolled. Releasing a
 * controlled key prop (defined -> `undefined`) resets the internal value
 * instead of keeping the last controlled value.
 */
describe('tree controlled -> uncontrolled release', () => {
  it('resets expandedKeys to empty and becomes uncontrolled', async () => {
    const wrapper = mount(Tree, {
      props: { treeData: treeData as any, expandedKeys: ['parent'] },
    })
    expect(visibleNodes(wrapper)).toBe(2)

    await wrapper.setProps({ expandedKeys: undefined })
    expect(visibleNodes(wrapper)).toBe(1)

    // Now uncontrolled, click should expand
    await wrapper.get('.vc-tree-switcher').trigger('click')
    expect(visibleNodes(wrapper)).toBe(2)
  })

  it('resets every controlled key prop', async () => {
    const wrapper = mount(Tree, {
      props: {
        treeData: treeData as any,
        checkable: true,
        expandedKeys: ['parent'],
        selectedKeys: ['parent'],
        checkedKeys: ['child'],
        loadedKeys: ['parent'],
        activeKey: 'parent',
      },
    })
    expect(wrapper.findAll('.vc-tree-node-selected')).toHaveLength(1)
    expect(wrapper.findAll('.vc-tree-checkbox-checked')).toHaveLength(2)
    expect(wrapper.findAll('.vc-tree-treenode-active')).toHaveLength(1)

    await wrapper.setProps({
      selectedKeys: undefined,
      checkedKeys: undefined,
      loadedKeys: undefined,
      activeKey: undefined,
    })
    expect(wrapper.findAll('.vc-tree-node-selected')).toHaveLength(0)
    expect(wrapper.findAll('.vc-tree-checkbox-checked')).toHaveLength(0)
    expect(wrapper.findAll('.vc-tree-treenode-active')).toHaveLength(0)

    // Focus after release should not crash on `selectedKeys.find`
    await wrapper.get('[role="tree"]').trigger('focus')
  })

  it('toggling autoExpandParent while uncontrolled leaves expandedKeys alone', async () => {
    const wrapper = mount(Tree, {
      props: { treeData: treeData as any, defaultExpandedKeys: ['parent'], autoExpandParent: false },
    })
    expect(visibleNodes(wrapper)).toBe(2)

    await wrapper.setProps({ autoExpandParent: true })
    expect(visibleNodes(wrapper)).toBe(2)
  })

  it('re-conducts controlled expandedKeys when autoExpandParent turns on', async () => {
    const nested = [
      {
        key: 'parent',
        title: 'parent',
        children: [{ key: 'child', title: 'child', children: [{ key: 'leaf', title: 'leaf' }] }],
      },
    ]
    const wrapper = mount(Tree, {
      props: { treeData: nested as any, expandedKeys: ['child'], autoExpandParent: false, defaultExpandParent: false },
    })
    expect(visibleNodes(wrapper)).toBe(1)

    await wrapper.setProps({ autoExpandParent: true })
    expect(visibleNodes(wrapper)).toBe(3)
  })
})
