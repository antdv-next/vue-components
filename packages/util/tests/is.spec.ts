import { h } from 'vue'
import { describe, expect, it } from 'vitest'
import { isNonNullable, isVueRenderable } from '../src'

describe('is', () => {
  describe('isNonNullable', () => {
    it.each([undefined, null])('returns false for nullable value %p', (value) => {
      expect(isNonNullable(value)).toBeFalsy()
    })

    it.each([false, '', 0, 'text', h('span')])(
      'returns true for non-nullable value %p',
      (value) => {
        expect(isNonNullable(value)).toBeTruthy()
      },
    )
  })

  describe('isVueRenderable', () => {
    it.each([undefined, null, false, ''])(
      'returns false for non-renderable value %p',
      (value) => {
        expect(isVueRenderable(value)).toBeFalsy()
      },
    )

    it.each([0, true, 'text', h('span')])(
      'returns true for renderable value %p',
      (value) => {
        expect(isVueRenderable(value)).toBeTruthy()
      },
    )
  })
})
