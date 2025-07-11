import { describe, expect, it } from 'vitest'
import { FastColor } from '../src'

// Support CSS hsl() and hsla() syntax with absolute values
// https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/hsl
describe('css hsl() syntax', () => {
  describe('new space-separated syntax', () => {
    it('without units', () => {
      expect(new FastColor('hsl(270 60 40)').toRgb()).toEqual({
        r: 102,
        g: 41,
        b: 163,
        a: 1,
      })

      expect(new FastColor('hsl(270 60 40 / 0.2)').toRgb()).toEqual({
        r: 102,
        g: 41,
        b: 163,
        a: 0.2,
      })

      expect(new FastColor('hsl(270 60 40 / .2)').toRgb()).toEqual({
        r: 102,
        g: 41,
        b: 163,
        a: 0.2,
      })

      expect(new FastColor('hsl(270 60 40 / 0.233)').toRgb()).toEqual({
        r: 102,
        g: 41,
        b: 163,
        a: 0.233,
      })

      expect(new FastColor('hsl(270 60 40 / .233)').toRgb()).toEqual({
        r: 102,
        g: 41,
        b: 163,
        a: 0.233,
      })
    })

    it('with units', () => {
      expect(new FastColor('hsl(270 60 40)').toRgb()).toEqual({
        r: 102,
        g: 41,
        b: 163,
        a: 1,
      })

      expect(new FastColor('hsl(270 60 40)').toRgb()).toEqual({
        r: 102,
        g: 41,
        b: 163,
        a: 1,
      })

      expect(new FastColor('hsl(270 60 40 / 20%)').toRgb()).toEqual({
        r: 102,
        g: 41,
        b: 163,
        a: 0.2,
      })

      expect(new FastColor('hsl(270 60 40 / 23.3%)').toRgb()).toEqual({
        r: 102,
        g: 41,
        b: 163,
        a: 0.233,
      })
    })
  })

  describe('old comma-separated syntax', () => {
    it('without units', () => {
      expect(new FastColor('hsl(270, 60, 40)').toRgb()).toEqual({
        r: 102,
        g: 41,
        b: 163,
        a: 1,
      })

      expect(new FastColor('hsla(270, 60, 40, 0.2)').toRgb()).toEqual({
        r: 102,
        g: 41,
        b: 163,
        a: 0.2,
      })

      expect(new FastColor('hsla(270, 60, 40, .2)').toRgb()).toEqual({
        r: 102,
        g: 41,
        b: 163,
        a: 0.2,
      })

      expect(new FastColor('hsla(270, 60, 40, 0.233)').toRgb()).toEqual({
        r: 102,
        g: 41,
        b: 163,
        a: 0.233,
      })

      expect(new FastColor('hsla(270, 60, 40, .233)').toRgb()).toEqual({
        r: 102,
        g: 41,
        b: 163,
        a: 0.233,
      })
    })

    it('with units', () => {
      expect(new FastColor('hsl(270deg, 60%, 40%)').toRgb()).toEqual({
        r: 102,
        g: 41,
        b: 163,
        a: 1,
      })

      expect(new FastColor('hsla(270deg, 60%, 40%, 20%)').toRgb()).toEqual({
        r: 102,
        g: 41,
        b: 163,
        a: 0.2,
      })

      expect(new FastColor('hsla(270deg, 60%, 40%, 23.3%)').toRgb()).toEqual({
        r: 102,
        g: 41,
        b: 163,
        a: 0.233,
      })

      // String back
      expect(new FastColor('hsla(270, 60, 40, 0.2)').toHslString()).toEqual(
        'hsla(270,60%,40%,0.2)',
      )
      expect(
        new FastColor('hsla(270deg, 60%, 40%, 23.3%)').toHslString(),
      ).toEqual('hsla(270,60%,40%,0.233)')
    })
  })
})
