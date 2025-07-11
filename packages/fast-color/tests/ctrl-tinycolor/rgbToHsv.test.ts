import type { HSV } from '../../src'
import { rgbToHsv, TinyColor } from '@ctrl/tinycolor'
import { expect, it } from 'vitest'
import { FastColor } from '../../src'

it('rgbToHsv alternative', () => {
  const r = 102
  const g = 204
  const b = 255
  const hsv: HSV = new TinyColor(rgbToHsv(r, g, b)).toHsv()
  hsv.h = Math.round(hsv.h * 360)
  hsv.a = 1
  expect(new FastColor({ r, g, b }).toHsv()).toEqual(hsv)
})
