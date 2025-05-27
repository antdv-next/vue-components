import { describe, expect, it } from 'vitest'
import Schema from '../src'

describe('asyncValidator', () => {
  it('works', () => {
    new Schema({
      v: [
        {
          asyncValidator() {
            return Promise.reject(new Error('e1'))
          },
        },
        {
          asyncValidator() {
            return Promise.reject(new Error('e2'))
          },
        },
      ],
      v2: [
        {
          asyncValidator() {
            return Promise.reject(new Error('e3'))
          },
        },
      ],
    }).validate(
      {
        v: 2,
      },
      (errors) => {
        expect(errors?.length).toBe(3)
        expect(errors?.[0].message).toBe('e1')
        expect(errors?.[1].message).toBe('e2')
        expect(errors?.[2].message).toBe('e3')
      },
    )
  })

  it('first works', () => {
    new Schema({
      v: [
        {
          asyncValidator() {
            return Promise.reject(new Error('e1'))
          },
        },
        {
          asyncValidator() {
            return Promise.reject(new Error('e2'))
          },
        },
      ],
      v2: [
        {
          asyncValidator() {
            return Promise.reject(new Error('e3'))
          },
        },
      ],
    }).validate(
      {
        v: 2,
        v2: 1,
      },
      {
        first: true,
      },
      (errors) => {
        expect(errors?.length).toBe(1)
        expect(errors?.[0].message).toBe('e1')
      },
    )
  })

  describe('firstFields', () => {
    it('works for true', () => {
      new Schema({
        v: [
          {
            asyncValidator() {
              return Promise.reject(new Error('e1'))
            },
          },
          {
            asyncValidator() {
              return Promise.reject(new Error('e2'))
            },
          },
        ],

        v2: [
          {
            asyncValidator() {
              return Promise.reject(new Error('e3'))
            },
          },
        ],
        v3: [
          {
            asyncValidator() {
              return Promise.reject(new Error('e4'))
            },
          },
          {
            asyncValidator() {
              return Promise.reject(new Error('e5'))
            },
          },
        ],
      }).validate(
        {
          v: 1,
          v2: 1,
          v3: 1,
        },
        {
          firstFields: true,
        },
        (errors) => {
          expect(errors?.length).toBe(3)
          expect(errors?.[0].message).toBe('e1')
          expect(errors?.[1].message).toBe('e3')
          expect(errors?.[2].message).toBe('e4')
        },
      )
    })

    it('works for array', () => {
      new Schema({
        v: [
          {
            asyncValidator: () => {
              return Promise.reject(new Error('e1'))
            },
          },
          {
            asyncValidator() {
              return Promise.reject(new Error('e2'))
            },
          },
        ],

        v2: [
          {
            asyncValidator() {
              return Promise.reject(new Error('e3'))
            },
          },
        ],
        v3: [
          {
            asyncValidator() {
              return Promise.reject(new Error('e4'))
            },
          },
          {
            asyncValidator() {
              return Promise.reject(new Error('e5'))
            },
          },
        ],
        v4: [
          {
            asyncValidator: () =>
              new Promise((resolve) => {
                setTimeout(resolve, 100)
              }),
          },
          {
            asyncValidator: () =>
              new Promise((_resolve, reject) => {
                setTimeout(() => reject(new Error('e6')), 100)
              }),
          },
          {
            asyncValidator: () =>
              new Promise((_resolve, reject) => {
                // eslint-disable-next-line unicorn/error-message
                setTimeout(() => reject(new Error('')), 100)
              }),
          },
        ],
      }).validate(
        {
          v: 1,
          v2: 1,
          v3: 1,
        },
        {
          firstFields: ['v'],
        },
        (errors) => {
          expect(errors?.length).toBe(6)
          expect(errors?.[0].message).toBe('e1')
          expect(errors?.[1].message).toBe('e3')
          expect(errors?.[2].message).toBe('e4')
          expect(errors?.[3].message).toBe('e5')
          expect(errors?.[4].message).toBe('e6')
          expect(errors?.[5].message).toBe('')
        },
      )
    })
    it('whether to remove the \'Uncaught (in promise)\' warning', async () => {
      let allCorrect = true
      try {
        await new Schema({
          async: {
            asyncValidator(rule) {
              return new Promise((_resolve, reject) => {
                setTimeout(() => {
                  // eslint-disable-next-line prefer-promise-reject-errors
                  reject([
                    new Error(typeof rule.message === 'function' ? rule.message() : rule.message),
                  ])
                }, 100)
              })
            },
            message: 'async fails',
          },
        }).validate({
          v: 1,
        })
      }
      catch (e: any) {
        allCorrect = e.errors?.length === 1
      }
      expect(allCorrect).toBe(true)
    })
  })
})
