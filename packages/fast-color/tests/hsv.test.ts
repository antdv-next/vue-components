import { describe, expect, it } from 'vitest'
import { FastColor } from '../src'

describe('hsv', () => {
  it('hsv object to hex', () => {
    expect(new FastColor({ h: 270, s: 0.6, v: 0.4 }).toHexString()).toBe(
      '#472966',
    )
  })

  it('hsv string to hex', () => {
    expect(new FastColor('hsv(270, 60%, 40%)').toHexString()).toBe('#472966')
  })

  it('hsb string to hex', () => {
    expect(new FastColor('hsb(270 60 40)').toHexString()).toBe('#472966')
  })

  it('hex to hsv object', () => {
    expect(new FastColor('#472966').toHsv()).toEqual({
      h: 270,
      s: 0.5980392156862745,
      v: 0.4,
      a: 1,
    })
  })

  it('should be same RGB', () => {
    const base = new FastColor({
      h: 180,
      s: 0,
      v: 0,
    })

    const turn = base.setHue(0)

    expect(base.toHexString()).toEqual(turn.toHexString())
  })

  it('clone should be same hsv', () => {
    const base = new FastColor({
      h: 180,
      s: 0,
      v: 0,
    })

    const turn = base.clone()

    expect(base.toHsv()).toEqual(turn.toHsv())
  })

  it('setHue should be stable', () => {
    const base = new FastColor('#1677ff')
    expect(base.getValue()).toBe(1)

    const turn = base.setHue(233)
    expect(turn.getValue()).toBe(1)
  })
})
