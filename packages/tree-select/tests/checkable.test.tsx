import type { DataNode } from '../src/interface'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'
import TreeSelect from '../src'
import { SHOW_PARENT } from '../src/utils/strategyUtil'

async function flushSelect() {
  await nextTick()
  await new Promise(resolve => setTimeout(resolve))
  await nextTick()
}

function getSelections() {
  return Array.from(document.body.querySelectorAll('.vc-tree-select-selection-item'))
}

function getSelectionTexts() {
  return getSelections().map(item =>
    item.querySelector('.vc-tree-select-selection-item-content')?.textContent?.trim(),
  )
}

function selectNode(index = 0) {
  const nodes = document.body.querySelectorAll('.vc-tree-select-tree-node-content-wrapper')
  ;(nodes[index] as HTMLElement).click()
}

const treeData: DataNode[] = [
  {
    title: 'Node1',
    value: '0-0',
    key: '0-0',
    children: [
      {
        title: 'Child Node1',
        value: '0-0-0',
        key: '0-0-0',
      },
    ],
  },
  {
    title: 'Node2',
    value: '0-1',
    key: '0-1',
    children: [
      {
        title: 'Child Node3',
        value: '0-1-0',
        key: '0-1-0',
        disabled: true,
      },
      {
        title: 'Child Node4',
        value: '0-1-1',
        key: '0-1-1',
      },
      {
        title: 'Child Node5',
        value: '0-1-2',
        key: '0-1-2',
      },
    ],
  },
]

describe('treeSelect.checkable', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  // https://github.com/react-component/tree-select/pull/681
  it('should keep disabled child selected when checking its parent', async () => {
    const App = defineComponent({
      setup() {
        const value = ref<string[]>(['0-1-0'])

        return () => (
          <TreeSelect
            open
            treeCheckable
            treeDefaultExpandAll
            showCheckedStrategy={SHOW_PARENT}
            value={value.value}
            onChange={(next: string[]) => {
              value.value = next
            }}
            treeData={treeData}
          />
        )
      },
    })

    const wrapper = mount(App, { attachTo: document.body })
    await flushSelect()

    // `0-1-0` (Child Node3) is disabled and pre-checked
    expect(getSelectionTexts()).toEqual(['Child Node3'])

    // Rendered order is 0-0, 0-0-0, 0-1, ... so index 2 is `Node2` (0-1)
    selectNode(2)
    await flushSelect()

    // SHOW_PARENT must not swallow the disabled child into its now-checked parent
    expect(getSelections()).toHaveLength(2)
    expect(getSelectionTexts()).toEqual(expect.arrayContaining(['Node2', 'Child Node3']))

    wrapper.unmount()
  })
})
