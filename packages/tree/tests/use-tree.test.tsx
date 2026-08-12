import { describe, expect, it } from 'vitest'
import { shallowRef } from 'vue'
import { useTree } from '../src'

describe('useTree', () => {
  it('returns the entity path from root to target', () => {
    const treeData = [{ key: 'root', children: [{ key: 'target' }] }]
    const { getPath } = useTree(treeData)

    expect(getPath('target').map(entity => entity.key)).toEqual(['root', 'target'])
    expect(getPath('missing')).toEqual([])
  })

  it('supports custom field names', () => {
    const treeData = [{ id: 'root', nodes: [{ id: 'target' }] }]
    const { getPath } = useTree(treeData as any, {
      fieldNames: { key: 'id', children: 'nodes' },
    })

    expect(getPath('target').map(entity => entity.node.id)).toEqual(['root', 'target'])
  })

  it('follows reactive treeData', () => {
    const treeData = shallowRef<any[]>([{ key: 'first' }])
    const { getPath } = useTree(treeData)

    expect(getPath('first').map(entity => entity.key)).toEqual(['first'])

    treeData.value = [{ key: 'second' }]

    expect(getPath('first')).toEqual([])
    expect(getPath('second').map(entity => entity.key)).toEqual(['second'])
  })
})
