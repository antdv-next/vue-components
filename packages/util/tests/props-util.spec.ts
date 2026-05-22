import { createCommentVNode, createTextVNode, createVNode, Fragment, h } from 'vue'
import { describe, expect, it } from 'vitest'
import { filterEmpty, isEmptyElement } from '../src/props-util'

describe('isEmptyElement', () => {
  it('treats Vue comment vnodes as empty (regression: Comment was not imported from vue)', () => {
    expect(isEmptyElement(createCommentVNode('v-if'))).toBe(true)
  })

  it('treats blank Vue text vnodes as empty (regression: Text was not imported from vue)', () => {
    expect(isEmptyElement(createTextVNode('   '))).toBe(true)
  })

  it('does not treat non-blank text vnodes as empty', () => {
    expect(isEmptyElement(createTextVNode('hello'))).toBe(false)
  })

  it('treats empty Fragment vnodes as empty', () => {
    expect(isEmptyElement(createVNode(Fragment, null, []))).toBe(true)
  })

  it('does not treat Fragment with children as empty', () => {
    expect(isEmptyElement(createVNode(Fragment, null, [h('span', 'x')]))).toBe(false)
  })

  it('does not treat real element vnodes as empty', () => {
    expect(isEmptyElement(h('div'))).toBe(false)
  })

  it('returns falsy for nullish input', () => {
    expect(isEmptyElement(null)).toBeFalsy()
    expect(isEmptyElement(undefined)).toBeFalsy()
  })
})

describe('filterEmpty', () => {
  it('filters out comment vnodes (regression for v-if placeholders)', () => {
    expect(filterEmpty([createCommentVNode('v-if')])).toHaveLength(0)
  })

  it('filters out blank text vnodes', () => {
    expect(filterEmpty([createTextVNode('   ')])).toHaveLength(0)
  })

  it('keeps non-empty vnodes and drops the comment in a mixed list', () => {
    const real = h('span', 'ok')
    const result = filterEmpty([real, createCommentVNode('v-if')])
    expect(result).toHaveLength(1)
    expect(result[0]).toBe(real)
  })

  it('flattens Fragment children and filters their comments too', () => {
    const real = h('span', 'ok')
    const fragment = createVNode(Fragment, null, [real, createCommentVNode('v-if')])
    const result = filterEmpty([fragment])
    expect(result).toHaveLength(1)
    expect(result[0]).toBe(real)
  })

  it('accepts a non-array single child', () => {
    expect(filterEmpty(createCommentVNode('v-if') as any)).toHaveLength(0)
  })

  it('returns [] for empty input', () => {
    expect(filterEmpty([])).toHaveLength(0)
    expect(filterEmpty()).toHaveLength(0)
  })
})
