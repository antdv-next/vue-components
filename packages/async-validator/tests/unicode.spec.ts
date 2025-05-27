import { describe, expect, it } from 'vitest'
import Schema from '../src'

describe('unicode', () => {
  it('works for unicode U+0000 to U+FFFF ', () => {
    new Schema({
      v: {
        type: 'string',
        len: 4,
      },
    }).validate(
      {
        v: '吉吉吉吉',
      },
      (errors) => {
        expect(errors).toBe(null)
      },
    )
  })

  it('works for unicode gt U+FFFF ', () => {
    new Schema({
      v: {
        type: 'string',
        len: 4, // 原来length属性应该为8，更正之后应该为4
      },
    }).validate(
      {
        v: '𠮷𠮷𠮷𠮷',
      },
      (errors) => {
        expect(errors).toBe(null)
      },
    )
  })

  it('rich Text Format', () => {
    new Schema({
      v: {
        type: 'string',
        len: 2,
      },
    }).validate(
      {
        v: '💩💩',
      },
      (errors) => {
        expect(errors).toBe(null)
      },
    )
  })
})
