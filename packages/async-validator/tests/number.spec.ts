import { describe, expect, it } from 'vitest'
import Schema from '../src'

describe('number', () => {
  it('works', () => {
    new Schema({
      v: {
        type: 'number',
      },
    }).validate(
      {
        v: '1',
      },
      (errors) => {
        expect(errors?.length).toBe(1)
        expect(errors?.[0].message).toBe('v is not a number')
      },
    )
  })

  it('works for no-required', () => {
    new Schema({
      v: {
        type: 'number',
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

  it('works for no-required in case of empty string', () => {
    new Schema({
      v: {
        type: 'number',
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

  it('works for required', () => {
    new Schema({
      v: {
        type: 'number',
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

  it('transform does not change value', () => {
    const value = {
      v: '1',
    }
    new Schema({
      v: {
        type: 'number',
        transform: Number,
      },
    }).validate(value, (errors, data) => {
      expect(data).toEqual({
        v: 1,
      })
      expect(value.v).toBe('1')
      expect(errors).toBeFalsy()
    })
  })

  it('return transformed value in promise.then', () => {
    const value = {
      v: '1',
    }
    new Schema({
      v: {
        type: 'number',
        transform: Number,
      },
    })
      .validate(value, (errors) => {
        expect(value.v).toBe('1')
        expect(errors).toBeFalsy()
      })
      .then((source) => {
        expect(source).toEqual({
          v: 1,
        })
      })
  })
  it('transform type', () => {
    const value = { v: 'a' }
    new Schema({
      v: { required: true, type: 'number', transform: () => 0 },
    })
      .validate(value, (errors) => {
        expect(errors).toBeFalsy()
      })
      .then((source) => {
        expect(source).toEqual({ v: 0 })
      })
  })
  it('transform string', () => {
    const value = { v: 'a' }
    new Schema({
      v: { required: true, transform: v => v },
    })
      .validate(value, (errors) => {
        expect(errors).toBeFalsy()
      })
      .then((source) => {
        expect(source).toEqual({ v: 'a' })
      })
  })
  it('transform number', () => {
    const value = { v: 0 }
    new Schema({
      v: { required: true, transform: v => v },
    })
      .validate(value, (errors) => {
        expect(errors).toBeFalsy()
      })
      .then((source) => {
        expect(source).toEqual({ v: 0 })
      })
  })
  it('transform array', () => {
    const value = { v: [0, 1] }
    new Schema({
      v: { required: true, transform: v => v },
    })
      .validate(value, (errors) => {
        expect(errors).toBeFalsy()
      })
      .then((source) => {
        expect(source).toEqual({ v: [0, 1] })
      })
  })
  it('transform undefined', () => {
    const value = { v: [0, 1] }
    new Schema({
      v: { required: true, transform: () => undefined },
    }).validate(value, (errors) => {
      expect(errors).toBeTruthy()
      expect(errors?.[0].message).toBe('v is required')
    })
  })
  it('empty array message is "v is required"', () => {
    const value = { v: [] }
    new Schema({
      v: { required: true, transform: () => [] },
    }).validate(value, (errors) => {
      expect(errors).toBeTruthy()
      expect(errors?.[0].message).toBe('v is required')
    })
  })
})
