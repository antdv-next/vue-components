import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'
import Tree, { TreeNode } from '../src'

function renderNodes() {
  return [
    <TreeNode key="parent" title="parent">
      <TreeNode key="child" title="child">
        <TreeNode key="leaf" title="leaf" />
      </TreeNode>
    </TreeNode>,
    <TreeNode key="other" title="other">
      <TreeNode key="other-1" title="other-1" />
    </TreeNode>,
  ]
}

function mountSlotTree(props: Record<string, any>) {
  return mount(Tree, {
    props: { virtual: false, ...props },
    slots: { default: renderNodes },
  })
}

const titles = (wrapper: ReturnType<typeof mount>) => wrapper.findAll('.vc-tree-title').map(node => node.text())

const cases = [
  { name: 'uncontrolled defaultExpandAll', props: { defaultExpandAll: true }, expected: ['parent', 'child', 'leaf', 'other', 'other-1'] },
  { name: 'uncontrolled defaultExpandedKeys + defaultExpandParent', props: { defaultExpandedKeys: ['child'] }, expected: ['parent', 'child', 'leaf', 'other'] },
  { name: 'uncontrolled defaultExpandedKeys without defaultExpandParent', props: { defaultExpandedKeys: ['child'], defaultExpandParent: false }, expected: ['parent', 'other'] },
  { name: 'controlled keys + autoExpandParent', props: { expandedKeys: ['child'], autoExpandParent: true, defaultExpandParent: false }, expected: ['parent', 'child', 'leaf', 'other'] },
  { name: 'controlled keys without parent expansion', props: { expandedKeys: ['child'], autoExpandParent: false, defaultExpandParent: false }, expected: ['parent', 'other'] },
  { name: 'controlled empty keys ignore defaultExpandAll', props: { expandedKeys: [], defaultExpandAll: true }, expected: ['parent', 'other'] },
]

describe('slot TreeNode initial expansion', () => {
  it.each(cases)('$name', ({ props, expected }) => {
    const wrapper = mountSlotTree(props)
    expect(titles(wrapper)).toEqual(expected)
    wrapper.unmount()
  })

  it('only applies default expansion on first parse, not when slot children change', async () => {
    const extra = ref(false)
    const Demo = defineComponent(() => () => (
      <Tree virtual={false} defaultExpandAll>
        <TreeNode key="parent" title="parent">
          <TreeNode key="child" title="child" />
        </TreeNode>
        {extra.value
          ? (
              <TreeNode key="late" title="late">
                <TreeNode key="late-1" title="late-1" />
              </TreeNode>
            )
          : null}
      </Tree>
    ))
    const wrapper = mount(Demo)
    expect(titles(wrapper)).toEqual(['parent', 'child'])

    extra.value = true
    await nextTick()
    expect(titles(wrapper)).toEqual(['parent', 'child', 'late'])
    wrapper.unmount()
  })
})
