import { describe, expect, it } from 'vitest'
import Schema from '../src'

function testNoErrorsFor(value: unknown) {
  return () => {
    return new Schema({
      v: {
        type: 'any',
      },
    }).validate(
      {
        v: value,
      },
      (errors) => {
        expect(errors).toBe(null)
      },
    )
  }
}

function testRequiredErrorFor(value: unknown) {
  return async () => {
    new Schema({
      v: {
        required: true,
        type: 'string',
      },
    }).validate(
      {
        v: value,
      },
      (errors) => {
        expect(errors?.length).toBe(1)
        expect(errors?.[0].message).toBe('v is required')
      },
    )
  }
}

describe('any', () => {
  it('allows null', testNoErrorsFor(null))
  it('allows undefined', testNoErrorsFor(undefined))
  it('allows strings', testNoErrorsFor('foo'))
  it('allows numbers', testNoErrorsFor(1))
  it('allows booleans', testNoErrorsFor(false))
  it('allows arrays', testNoErrorsFor([]))
  it('allows objects', testNoErrorsFor({}))
  it('rejects undefined when required', testRequiredErrorFor(undefined))
  it('rejects null when required', testRequiredErrorFor(null))
})
