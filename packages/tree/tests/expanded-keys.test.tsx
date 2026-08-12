import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import Tree from '../src'

/**
 * Characterization tests for controlled `expandedKeys`.
 *
 * These pin CURRENT behaviour, which deliberately deviates from upstream.
 *
 * Upstream rc-tree guards centrally inside `setExpandedKeys`:
 *
 *   setExpandedKeys = (expandedKeys) => {
 *     if (this.props.hasOwnProperty('expandedKeys')) return   // react-component/tree#1044
 *     ...
 *   }
 *
 * so a controlled `expandedKeys` is never written by internal handlers, and
 * upstream asserts exactly that in `tests/ExpandedKeys.spec.tsx`.
 *
 * We ported that guard and then reverted it (`5fe098f`); the revert moved the
 * check to individual call sites, and only two of the five got one. The result
 * is "optimistic expansion": the three unguarded handlers below update internal
 * state even when the parent owns `expandedKeys`, so a parent that ignores
 * `onExpand` does NOT keep the tree collapsed the way upstream would.
 *
 * The revert commit records no reason, so these tests do not assert that the
 * deviation is *right* — they assert what it *is*, so that a future upstream
 * sync has to change them consciously instead of silently flipping behaviour.
 * If the guard is ever restored, the three `deviates from upstream` cases below
 * are the ones expected to change.
 */

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

  it('deviates from upstream: click expands even when expandedKeys is controlled', async () => {
    const onExpand = vi.fn()
    // The parent never reacts to `onExpand`, so `expandedKeys` stays `[]`.
    const wrapper = mount(() => (
      <Tree treeData={treeData as any} expandedKeys={[]} onExpand={onExpand} />
    ))
    expect(visibleNodes(wrapper)).toBe(1)

    await wrapper.get('.vc-tree-switcher').trigger('click')

    expect(onExpand).toHaveBeenCalledWith(['parent'], expect.objectContaining({ expanded: true }))
    // Upstream would stay at 1 here — the parent owns the expansion.
    expect(visibleNodes(wrapper)).toBe(2)
  })

  it('deviates from upstream: a rejected loadData collapses controlled expandedKeys', async () => {
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
    // The rollback writes internal state even though `expandedKeys` is controlled.
    expect(wrapper.get('.vc-tree-switcher').classes()).not.toContain('vc-tree-switcher_open')
  })

  it('deviates from upstream: dragstart collapses a controlled expanded node', async () => {
    const wrapper = mount(() => (
      <Tree treeData={treeData as any} expandedKeys={['parent']} draggable />
    ))
    expect(visibleNodes(wrapper)).toBe(2)

    await wrapper
      .get('.vc-tree-treenode[role="treeitem"] .vc-tree-node-content-wrapper')
      .trigger('dragstart')

    // Upstream would stay at 2 — `setExpandedKeys` would be a no-op.
    expect(visibleNodes(wrapper)).toBe(1)
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
