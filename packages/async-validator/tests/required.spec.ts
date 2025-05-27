import { describe, expect, it } from 'vitest'
import Schema from '../src'

const required = true

describe('required', () => {
  it('works for array required=true', () => {
    new Schema({
      v: [
        {
          required,
          message: 'no',
        },
      ],
    }).validate(
      {
        v: [],
      },
      (errors) => {
        expect(errors?.length).toBe(1)
        expect(errors?.[0].message).toBe('no')
      },
    )
  })

  it('works for array required=true & custom message', () => {
    // allow custom message
    new Schema({
      v: [
        {
          required,
          message: 'no',
        },
      ],
    }).validate(
      {
        v: [1],
      },
      (errors) => {
        expect(errors).toBeFalsy()
      },
    )
  })

  it('works for array required=false', () => {
    new Schema({
      v: {
        required: false,
      },
    }).validate(
      {
        v: [],
      },
      (errors) => {
        expect(errors).toBeFalsy()
      },
    )
  })

  it('works for string required=true', () => {
    new Schema({
      v: {
        required,
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

  it('works for string required=false', () => {
    new Schema({
      v: {
        required: false,
      },
    }).validate(
      {
        v: '',
      },
      (errors) => {
        expect(errors).toBeFalsy()
      },
    )
  })

  it('works for number required=true', () => {
    new Schema({
      v: {
        required,
      },
    }).validate(
      {
        v: 1,
      },
      (errors) => {
        expect(errors).toBeFalsy()
      },
    )
  })

  it('works for number required=false', () => {
    new Schema({
      v: {
        required: false,
      },
    }).validate(
      {
        v: 1,
      },
      (errors) => {
        expect(errors).toBeFalsy()
      },
    )
  })

  it('works for null required=true', () => {
    new Schema({
      v: {
        required,
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

  it('works for null required=false', () => {
    new Schema({
      v: {
        required: false,
      },
    }).validate(
      {
        v: null,
      },
      (errors) => {
        expect(errors).toBeFalsy()
      },
    )
  })

  it('works for undefined required=true', () => {
    new Schema({
      v: {
        required,
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

  it('works for undefined required=false', () => {
    new Schema({
      v: {
        required: false,
      },
    }).validate(
      {
        v: undefined,
      },
      (errors) => {
        expect(errors).toBeFalsy()
      },
    )
  })

  it('should support empty string message', () => {
    new Schema({
      v: {
        required,
        message: '',
      },
    }).validate(
      {
        v: '',
      },
      (errors) => {
        expect(errors?.length).toBe(1)
        expect(errors?.[0].message).toBe('')
      },
    )
  })
})
