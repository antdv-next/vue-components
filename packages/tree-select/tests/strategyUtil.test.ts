import type { DataNode } from '../src/interface'
import { conductCheck, convertDataToEntities } from '@v-c/tree'
import { describe, expect, it } from 'vitest'
import { formatStrategyValues, SHOW_CHILD, SHOW_PARENT } from '../src/utils/strategyUtil'
import { fillFieldNames } from '../src/utils/valueUtil'

const fieldNames = fillFieldNames()

function getKeyEntities(treeData: DataNode[]) {
  return convertDataToEntities(treeData as any, { fieldNames: fieldNames as any }).keyEntities as any
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

describe('strategyUtil', () => {
  // https://github.com/react-component/tree-select/pull/681
  it('should keep disabled child selected when checking its parent', () => {
    const keyEntities = getKeyEntities(treeData)

    // `0-1-0` is disabled but pre-checked. Checking its parent `0-1` should not swallow it
    const { checkedKeys } = conductCheck(['0-1-0', '0-1'], true, keyEntities)

    expect(formatStrategyValues(checkedKeys as any, SHOW_PARENT, keyEntities, fieldNames as any))
      .toEqual(expect.arrayContaining(['0-1', '0-1-0']))
  })

  it('should drop enabled children of a checked parent with SHOW_PARENT', () => {
    const keyEntities = getKeyEntities(treeData)

    const { checkedKeys } = conductCheck(['0-0'], true, keyEntities)

    expect(formatStrategyValues(checkedKeys as any, SHOW_PARENT, keyEntities, fieldNames as any))
      .toEqual(['0-0'])
  })

  it('should keep leaf values only with SHOW_CHILD', () => {
    const keyEntities = getKeyEntities(treeData)

    const { checkedKeys } = conductCheck(['0-0'], true, keyEntities)

    expect(formatStrategyValues(checkedKeys as any, SHOW_CHILD, keyEntities, fieldNames as any))
      .toEqual(['0-0-0'])
  })
})
