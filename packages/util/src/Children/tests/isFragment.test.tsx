import { isFragment } from '@v-c/util/dist/Children/isFragment'
import { describe, expect, it } from 'vitest'
import { createVNode } from 'vue'

describe('isFragment', () => {
  it('should ', () => {
    const Dom = createVNode('div', null, '1')

    const dom = isFragment(Dom)
    const dom1 = isFragment(<>1</>)

    expect(dom).toBe(false)
    expect(dom1).toBe(true)
  })
})
