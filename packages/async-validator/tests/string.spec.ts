import { describe, expect, it } from 'vitest'
import Schema from '../src'

describe('string', () => {
  it('works for none require', () => {
    const data = {
      v: '',
    }
    new Schema({
      v: {
        type: 'string',
      },
    }).validate(data, (errors, d) => {
      expect(errors).toBe(null)
      expect(d).toEqual(data)
    })
  })

  it('works for empty string', () => {
    new Schema({
      v: {
        required: true,
        type: 'string',
      },
    }).validate(
      {
        v: '',
      },
      (errors) => {
        expect(errors?.length).toBe(1)
        expect(errors?.[0].message).toBe('v is required')
      },
    )
  })

  it('works for undefined string', () => {
    new Schema({
      v: {
        required: true,
        type: 'string',
      },
    }).validate(
      {
        v: undefined,
      },
      (errors) => {
        expect(errors?.length).toBe(1)
        expect(errors?.[0].message).toBe('v is required')
      },
    )
  })

  it('works for null string', () => {
    new Schema({
      v: {
        required: true,
        type: 'string',
      },
    }).validate(
      {
        v: null,
      },
      (errors) => {
        expect(errors?.length).toBe(1)
        expect(errors?.[0].message).toBe('v is required')
      },
    )
  })

  it('works for message', () => {
    new Schema({
      v: {
        required: true,
        type: 'string',
        message: 'haha',
      },
    }).validate(
      {
        v: null,
      },
      (errors) => {
        expect(errors?.length).toBe(1)
        expect(errors?.[0].message).toBe('haha')
      },
    )
  })

  it('works for none empty', () => {
    new Schema({
      v: {
        required: true,
        type: 'string',
        message: 'haha',
      },
    }).validate(
      {
        v: ' ',
      },
      (errors) => {
        expect(errors).toBe(null)
      },
    )
  })

  it('works for whitespace empty', () => {
    new Schema({
      v: {
        required: true,
        type: 'string',
        whitespace: true,
        message: 'haha',
      },
    }).validate(
      {
        v: ' ',
      },
      (errors) => {
        expect(errors?.length).toBe(1)
        expect(errors?.[0].message).toBe('haha')
      },
    )
  })
})
