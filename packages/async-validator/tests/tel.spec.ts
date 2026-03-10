import { describe, expect, it } from 'vitest'
import Schema from '../src'

describe('tel', () => {
  it('works for empty string', () => {
    new Schema({
      v: {
        type: 'tel',
      },
    }).validate(
      {
        v: '',
      },
      (errors) => {
        expect(errors).toBe(null)
      },
    )
  })

  it('works for china mobile phone number', () => {
    new Schema({
      v: {
        type: 'tel',
      },
    }).validate(
      {
        v: '13156451303',
      },
      (errors) => {
        expect(errors).toBe(null)
      },
    )
  })

  it('works for china mobile phone number with country code', () => {
    new Schema({
      v: {
        type: 'tel',
      },
    }).validate(
      {
        v: '+8613156451303',
      },
      (errors) => {
        expect(errors).toBe(null)
      },
    )
  })

  it('works for china mobile phone number with spaces', () => {
    new Schema({
      v: {
        type: 'tel',
      },
    }).validate(
      {
        v: '+86 131 5645 1303',
      },
      (errors) => {
        expect(errors).toBe(null)
      },
    )
  })

  it('works for us phone number with dashes', () => {
    new Schema({
      v: {
        type: 'tel',
      },
    }).validate(
      {
        v: '415-555-0132',
      },
      (errors) => {
        expect(errors).toBe(null)
      },
    )
  })

  it('works for us phone number with brackets, dashes, and spaces', () => {
    new Schema({
      v: {
        type: 'tel',
      },
    }).validate(
      {
        v: '(123) 456-7890',
      },
      (errors) => {
        expect(errors).toBe(null)
      },
    )
  })

  it('works for us phone number with nonbreaking hyphen', () => {
    new Schema({
      v: {
        type: 'tel',
      },
    }).validate(
      {
        v: '415‑555‑0132',
      },
      (errors) => {
        expect(errors).toBe(null)
      },
    )
  })

  it('forbid multiple spaces in a row', () => {
    new Schema({
      v: {
        type: 'tel',
      },
    }).validate(
      {
        v: '123   456',
      },
      (errors) => {
        expect(errors?.[0].message).toBe('v is not a valid tel')
      },
    )
  })

  it('forbid multiple dashes in a row', () => {
    new Schema({
      v: {
        type: 'tel',
      },
    }).validate(
      {
        v: '123---456',
      },
      (errors) => {
        expect(errors?.[0].message).toBe('v is not a valid tel')
      },
    )
  })

  it('works for required empty string', () => {
    new Schema({
      v: {
        type: 'tel',
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
})
