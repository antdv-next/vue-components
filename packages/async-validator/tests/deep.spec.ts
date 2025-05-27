import type { Rules } from '../src'
import { describe, expect, it } from 'vitest'
import Schema from '../src'

describe('deep', () => {
  it('deep array specific validation', () => {
    new Schema({
      v: {
        required: true,
        type: 'array',
        fields: {
          0: [{ type: 'string' }],
          1: [{ type: 'string' }],
        },
      },
    }).validate(
      {
        v: [1, 'b'],
      },
      (errors, fields) => {
        expect(errors?.length).toBe(1)
        expect(fields).toMatchInlineSnapshot(`
          {
            "v.0": [
              {
                "field": "v.0",
                "fieldValue": 1,
                "message": "v.0 is not a string",
              },
            ],
          }
        `)
        expect(errors?.[0].message).toBe('v.0 is not a string')
      },
    )
  })

  it('deep object specific validation', () => {
    new Schema({
      v: {
        required: true,
        type: 'object',
        fields: {
          a: [{ type: 'string' }],
          b: [{ type: 'string' }],
        },
      },
    }).validate(
      {
        v: {
          a: 1,
          b: 'c',
        },
      },
      (errors, fields) => {
        expect(errors?.length).toBe(1)
        expect(fields).toMatchInlineSnapshot(`
          {
            "v.a": [
              {
                "field": "v.a",
                "fieldValue": 1,
                "message": "v.a is not a string",
              },
            ],
          }
        `)
        expect(errors?.[0].message).toBe('v.a is not a string')
      },
    )
  })

  describe('defaultField', () => {
    it('deep array all values validation', () => {
      new Schema({
        v: {
          required: true,
          type: 'array',
          defaultField: [{ type: 'string' }],
        },
      }).validate(
        {
          v: [1, 2, 'c'],
        },
        (errors, fields) => {
          expect(errors?.length).toBe(2)
          expect(fields).toMatchInlineSnapshot(`
            {
              "v.0": [
                {
                  "field": "v.0",
                  "fieldValue": 1,
                  "message": "v.0 is not a string",
                },
              ],
              "v.1": [
                {
                  "field": "v.1",
                  "fieldValue": 2,
                  "message": "v.1 is not a string",
                },
              ],
            }
          `)
          expect(errors?.[0].message).toBe('v.0 is not a string')
          expect(errors?.[1].message).toBe('v.1 is not a string')
        },
      )
    })

    it('deep transform array all values validation', () => {
      new Schema({
        v: {
          required: true,
          type: 'array',
          defaultField: [{ type: 'number', max: 0, transform: Number }],
        },
      }).validate(
        {
          v: ['1', '2'],
        },
        (errors, fields) => {
          expect(errors?.length).toBe(2)
          expect(fields).toMatchInlineSnapshot(`
            {
              "v.0": [
                {
                  "field": "v.0",
                  "fieldValue": 1,
                  "message": "v.0 cannot be greater than 0",
                },
              ],
              "v.1": [
                {
                  "field": "v.1",
                  "fieldValue": 2,
                  "message": "v.1 cannot be greater than 0",
                },
              ],
            }
          `)
          expect(errors).toMatchInlineSnapshot(`
            [
              {
                "field": "v.0",
                "fieldValue": 1,
                "message": "v.0 cannot be greater than 0",
              },
              {
                "field": "v.1",
                "fieldValue": 2,
                "message": "v.1 cannot be greater than 0",
              },
            ]
          `)
        },
      )
    })

    it('will merge top validation', () => {
      const obj = {
        value: '',
        test: [
          {
            name: 'aa',
          },
        ],
      }

      const descriptor: Rules = {
        test: {
          type: 'array',
          min: 2,
          required: true,
          message: '至少两项',
          defaultField: [
            {
              type: 'object',
              required: true,
              message: 'test 必须有',
              fields: {
                name: {
                  type: 'string',
                  required: true,
                  message: 'name 必须有',
                },
              },
            },
          ],
        },
      }

      new Schema(descriptor).validate(obj, (errors) => {
        expect(errors).toMatchInlineSnapshot(`
          [
            {
              "field": "test",
              "fieldValue": [
                {
                  "name": "aa",
                },
              ],
              "message": "至少两项",
            },
          ]
        `)
      })
    })

    it('array & required works', () => {
      const descriptor: Rules = {
        testArray: {
          type: 'array',
          required: true,
          defaultField: [{ type: 'string' }],
        },
      }
      const record = {
        testArray: [],
      }
      const validator = new Schema(descriptor)
      validator.validate(record, () => {

      })
    })

    it('deep object all values validation', () => {
      new Schema({
        v: {
          required: true,
          type: 'object',
          defaultField: [{ type: 'string' }],
        },
      }).validate(
        {
          v: {
            a: 1,
            b: 'c',
          },
        },
        (errors) => {
          expect(errors?.length).toBe(1)
          expect(errors?.[0].message).toBe('v.a is not a string')
        },
      )
    })
  })
})
