import { describe, expect, it } from 'vitest'
import Schema from '../src'

describe('date', () => {
  it('required works for undefined', () => {
    new Schema({
      v: {
        type: 'date',
        required: true,
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

  it('required works for ""', () => {
    new Schema({
      v: {
        type: 'date',
        required: true,
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

  it('required works for non-date type', () => {
    new Schema({
      v: {
        type: 'date',
        required: true,
      },
    }).validate(
      {
        v: {},
      },
      (errors) => {
        expect(errors?.length).toBe(1)
        expect(errors?.[0].message).toBe('v is not a date')
      },
    )
  })

  it('required works for "timestamp"', () => {
    new Schema({
      v: {
        type: 'date',
        required: true,
      },
    }).validate(
      {
        v: 1530374400000,
      },
      (errors) => {
        expect(errors).toBe(null)
      },
    )
  })
})
