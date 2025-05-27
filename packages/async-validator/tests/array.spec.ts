import { describe, expect, it } from 'vitest'
import Schema from '../src'

describe('array', () => {
  it('works for type', () => {
    new Schema({
      v: {
        type: 'array',
      },
    }).validate(
      {
        v: '',
      },
      (errors) => {
        expect(errors?.length).toBe(1)
        expect(errors?.[0].message).toBe('v is not an array')
      },
    )
  })

  it('works for type and required', () => {
    new Schema({
      v: {
        required: true,
        type: 'array',
      },
    }).validate(
      {
        v: '',
      },
      (errors, fields) => {
        expect(errors?.length).toBe(1)
        expect(fields).toMatchInlineSnapshot(`
          {
            "v": [
              {
                "field": "v",
                "fieldValue": "",
                "message": "v is not an array",
              },
            ],
          }
        `)
        expect(errors?.[0].message).toBe('v is not an array')
      },
    )
  })

  it('works for none require', () => {
    new Schema({
      v: {
        type: 'array',
      },
    }).validate(
      {
        v: [],
      },
      (errors) => {
        expect(errors).toBe(null)
      },
    )
  })

  it('works for empty array', () => {
    new Schema({
      v: {
        required: true,
        type: 'array',
      },
    }).validate(
      {
        v: [],
      },
      (errors) => {
        expect(errors?.length).toBe(1)
        expect(errors?.[0].message).toBe('v is required')
      },
    )
  })

  it('works for undefined array', () => {
    new Schema({
      v: {
        type: 'array',
      },
    }).validate(
      {
        v: undefined,
      },
      (errors) => {
        expect(errors).toBe(null)
      },
    )
  })

  it('works for undefined array and required', () => {
    new Schema({
      v: {
        required: true,
        type: 'array',
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

  it('works for undefined array and defaultField', () => {
    new Schema({
      v: {
        type: 'array',
        defaultField: { type: 'string' },
      },
    }).validate(
      {
        v: undefined,
      },
      (errors) => {
        expect(errors).toBe(null)
      },
    )
  })

  it('works for null array', () => {
    new Schema({
      v: {
        required: true,
        type: 'array',
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

  it('works for none empty', () => {
    new Schema({
      v: {
        required: true,
        type: 'array',
        message: 'haha',
      },
    }).validate(
      {
        v: [1],
      },
      (errors) => {
        expect(errors).toBe(null)
      },
    )
  })

  it('works for empty array with min', () => {
    new Schema({
      v: {
        min: 1,
        max: 3,
        type: 'array',
      },
    }).validate(
      {
        v: [],
      },
      (errors) => {
        expect(errors?.length).toBe(1)
        expect(errors?.[0].message).toBe('v must be between 1 and 3 in length')
      },
    )
  })

  it('works for empty array with max', () => {
    new Schema({
      v: {
        min: 1,
        max: 3,
        type: 'array',
      },
    }).validate(
      {
        v: [1, 2, 3, 4],
      },
      (errors) => {
        expect(errors?.length).toBe(1)
        expect(errors?.[0].message).toBe('v must be between 1 and 3 in length')
      },
    )
  })
})
