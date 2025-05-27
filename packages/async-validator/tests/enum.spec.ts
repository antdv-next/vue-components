import { describe, expect, it } from 'vitest'
import Schema from '../src'

describe('enum', () => {
  it('run validation on `false`', () => {
    new Schema({
      v: {
        type: 'enum',
        enum: [true],
      },
    }).validate(
      {
        v: false,
      },
      (errors) => {
        expect(errors?.length).toBe(1)
        expect(errors?.[0].message).toBe('v must be one of true')
      },
    )
  })
})
