import { describe, expect, it } from 'vitest'
import { calcDropPosition } from '../src/util'
import { convertDataToEntities, fillFieldNames, flattenTreeData } from '../src/utils/treeUtil'

describe('tree drop position', () => {
  it('preserves a nested first child as the drop target', () => {
    const treeData = [
      {
        key: 'parent',
        title: 'parent',
        children: [
          { key: 'first', title: 'first' },
          { key: 'second', title: 'second' },
        ],
      },
      { key: 'drag', title: 'drag' },
    ]
    const { keyEntities } = convertDataToEntities(treeData)
    const flattenedNodes = flattenTreeData(treeData, ['parent'], fillFieldNames())
    const event = {
      clientX: 0,
      clientY: 5,
      target: {
        getBoundingClientRect: () => ({ top: 0, height: 20 }),
      },
    } as unknown as MouseEvent

    const result = calcDropPosition(
      event,
      { eventKey: 'drag', data: treeData[1] } as any,
      { eventKey: 'first', data: treeData[0].children![0] } as any,
      24,
      { x: 0, y: 0 },
      () => true,
      flattenedNodes,
      keyEntities,
      ['parent'],
      'ltr',
    )

    expect(result).toMatchObject({
      dropContainerKey: 'parent',
      dropPosition: -1,
      dropTargetKey: 'first',
    })
  })
})
