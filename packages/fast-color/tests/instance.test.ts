import { describe, expect, it } from 'vitest'
import { FastColor } from '../src'

describe('instance', () => {
  describe('clone', () => {
    it('clone should return same construct', () => {
      const base = new FastColor('#1677ff')
      const turn = base.clone()

      expect(turn instanceof FastColor)
    })

    it('extends should be same', () => {
      class Little extends FastColor {
        constructor() {
          super('#1677ff')
        }

        bamboo() {
          return 'beauty'
        }
      }

      const base = new Little()
      const turn = base.clone()

      expect(turn instanceof Little)
      expect(turn.bamboo()).toBe('beauty')
    })
  })
})
