import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import Tree from '../src'

const treeData = [
  {
    key: 'parent',
    title: 'parent',
    children: [{ key: 'child', title: 'child' }],
  },
  { key: 'other', title: 'other' },
]

function selectedTitles(wrapper: ReturnType<typeof mount>) {
  return wrapper.findAll('.vc-tree-node-selected .vc-tree-title').map(node => node.text())
}

function contentWrappers(wrapper: ReturnType<typeof mount>) {
  return wrapper.findAll('.vc-tree-node-content-wrapper')
}

function checkboxes(wrapper: ReturnType<typeof mount>) {
  return wrapper.findAll('.vc-tree-checkbox')
}

describe('tree controlled selectedKeys', () => {
  it('does not select a node while the parent ignores onSelect', async () => {
    const onSelect = vi.fn()
    const wrapper = mount(() => (
      <Tree treeData={treeData as any} selectedKeys={[]} onSelect={onSelect} />
    ))

    await contentWrappers(wrapper)[0].trigger('click')

    expect(onSelect).toHaveBeenCalledWith(['parent'], expect.objectContaining({ selected: true }))
    expect(selectedTitles(wrapper)).toEqual([])
  })

  it('does not accumulate keys in multiple mode while controlled', async () => {
    const onSelect = vi.fn()
    const wrapper = mount(() => (
      <Tree
        treeData={treeData as any}
        multiple
        selectedKeys={['other']}
        onSelect={onSelect}
      />
    ))

    await contentWrappers(wrapper)[0].trigger('click')

    expect(onSelect).toHaveBeenCalledWith(['other', 'parent'], expect.objectContaining({ selected: true }))
    expect(selectedTitles(wrapper)).toEqual(['other'])
  })

  it('still toggles selection when uncontrolled', async () => {
    const wrapper = mount(() => <Tree treeData={treeData as any} />)

    await contentWrappers(wrapper)[0].trigger('click')

    expect(selectedTitles(wrapper)).toEqual(['parent'])
  })
})

describe('tree controlled checkedKeys', () => {
  it('does not check a node while the parent ignores onCheck', async () => {
    const onCheck = vi.fn()
    const wrapper = mount(() => (
      <Tree treeData={treeData as any} checkable checkedKeys={[]} onCheck={onCheck} />
    ))

    await checkboxes(wrapper)[1].trigger('click')

    expect(onCheck).toHaveBeenCalledWith(['other'], expect.objectContaining({ checked: true }))
    expect(wrapper.findAll('.vc-tree-checkbox-checked')).toHaveLength(0)
  })

  it('does not check a node in checkStrictly mode while controlled', async () => {
    const onCheck = vi.fn()
    const wrapper = mount(() => (
      <Tree
        treeData={treeData as any}
        checkable
        checkStrictly
        checkedKeys={{ checked: [], halfChecked: [] }}
        onCheck={onCheck}
      />
    ))

    await checkboxes(wrapper)[1].trigger('click')

    expect(onCheck).toHaveBeenCalledWith(
      { checked: ['other'], halfChecked: [] },
      expect.objectContaining({ checked: true }),
    )
    expect(wrapper.findAll('.vc-tree-checkbox-checked')).toHaveLength(0)
  })

  it('still checks nodes when uncontrolled', async () => {
    const wrapper = mount(() => <Tree treeData={treeData as any} checkable />)

    await checkboxes(wrapper)[1].trigger('click')

    expect(wrapper.findAll('.vc-tree-checkbox-checked')).toHaveLength(1)
  })
})
