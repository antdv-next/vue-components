// Modified from https://github.com/scttcper/tinycolor/blob/master/test/index.spec.ts
import { describe, expect, it } from 'vitest'
import { FastColor } from '../../src'

describe('@ctrl/tinycolor compatibility', () => {
  it('should init', () => {
    const r = new FastColor('#66ccff')
    expect(r.toHexString()).toBe('#66ccff')
    expect(r).toBeTruthy()
  })

  it('should clone', () => {
    const color1 = new FastColor('#66ccff')
    expect(color1.toString()).toBe('rgb(102,204,255)')
    expect(color1.toRgb()).toEqual({
      a: 1,
      b: 255,
      g: 204,
      r: 102,
    })
    let color2 = color1.clone()
    expect(color2.toRgb()).toEqual({
      a: 1,
      b: 255,
      g: 204,
      r: 102,
    })
    color2 = color2.setA(0.5)
    expect(color2.toString()).toBe('rgba(102,204,255,0.5)')
  })

  it('should parse hex', () => {
    expect(new FastColor('#000').toHexString()).toBe('#000000')
    expect(new FastColor('#0000').toHexString()).toBe('#00000000')
    expect(new FastColor('#000').a).toBe(1)
    // Not sure this is expected behavior
    expect(new FastColor('#0000').a).toBe(0)
  })

  it('should parse rgb', () => {
    // parenthesized input
    expect(new FastColor('rgb(255,0,0)').toHexString()).toBe('#ff0000')
    // parenthesized spaced input
    expect(new FastColor('rgb (255,0,0)').toHexString()).toBe('#ff0000')
    // object input
    expect(new FastColor({ r: 255, g: 0, b: 0 }).toHexString()).toBe('#ff0000')
    // object input and compare
    expect(new FastColor({ r: 255, g: 0, b: 0 }).toRgb()).toEqual({
      r: 255,
      g: 0,
      b: 0,
      a: 1,
    })

    expect(
      new FastColor({ r: 200, g: 100, b: 0 }).equals(
        new FastColor('rgb(200, 100, 0)'),
      ),
    ).toBe(true)
    expect(
      new FastColor({ r: 200, g: 100, b: 0, a: 0.4 }).equals(
        new FastColor('rgba(200 100 0 .4)'),
      ),
    ).toBe(true)

    expect(
      new FastColor({ r: 199, g: 100, b: 0 }).equals(
        new FastColor({ r: 200, g: 100, b: 0 }),
      ),
    ).toBe(false)

    expect(
      new FastColor({ r: 199, g: 100, b: 0 }).equals(
        new FastColor({ r: 200, g: 100, b: 0 }),
      ),
    ).toBe(false)
  })

  it('should parse percentage rgb text', () => {
    // parenthesized input
    expect(new FastColor('rgb(100%, 0%, 0%)').toHexString()).toBe('#ff0000')
    // parenthesized spaced input
    expect(new FastColor('rgb (100%, 0%, 0%)').toHexString()).toBe('#ff0000')
  })

  it('should parse HSL', () => {
    // to hex
    expect(new FastColor({ h: 251, s: 1, l: 0.38 }).toHexString()).toBe(
      '#2400c2',
    )
    // to rgb
    expect(new FastColor({ h: 251, s: 1, l: 0.38 }).toRgbString()).toBe(
      'rgb(36,0,194)',
    )
    // to hsl
    expect(new FastColor({ h: 251, s: 1, l: 0.38 }).toHslString()).toBe(
      'hsl(251,100%,38%)',
    )
    expect(
      new FastColor({ h: 251, s: 1, l: 0.38, a: 0.38 }).toHslString(),
    ).toBe('hsla(251,100%,38%,0.38)')
    // to hex
    expect(new FastColor('hsl(251,100,38)').toHexString()).toBe('#2400c2')
    // to rgb
    expect(new FastColor('hsl(251,100%,38%)').toRgbString()).toBe(
      'rgb(36,0,194)',
    )
    // to hsl
    expect(new FastColor('hsl(251,100%,38%)').toHslString()).toBe(
      'hsl(251,100%,38%)',
    )
  })

  it('should get alpha', () => {
    let hexSetter = new FastColor('rgba(255,0,0,1)')
    // Alpha should start as 1
    expect(hexSetter.a).toBe(1)
    hexSetter = hexSetter.setA(0.9)
    // setAlpha should change alpha value
    expect(hexSetter.a).toBe(0.9)
    hexSetter = hexSetter.setA(0.5)
    // setAlpha should change alpha value
    expect(hexSetter.a).toBe(0.5)
  })

  it('should set alpha', () => {
    let hexSetter = new FastColor('rgba(255,0,0,1)')
    // Alpha should start as 1
    expect(hexSetter.a).toBe(1)
    hexSetter = hexSetter.setA(0.5)
    // setAlpha should change alpha value
    expect(hexSetter.a).toBe(0.5)
    hexSetter = hexSetter.setA(0)
    // setAlpha should change alpha value
    expect(hexSetter.a).toBe(0)
    hexSetter = hexSetter.setA(-1)
    // setAlpha with value < 0 is corrected to 0
    expect(hexSetter.a).toBe(0)
    hexSetter = hexSetter.setA(2)
    // setAlpha with value > 1 is corrected to 1
    expect(hexSetter.a).toBe(1)
  })

  it('should getBrightness', () => {
    expect(new FastColor('#000').getBrightness()).toBe(0)
    expect(new FastColor('#fff').getBrightness()).toBe(255)
  })

  it('should getLuminance', () => {
    expect(new FastColor('#000').getLuminance()).toBe(0)
    expect(new FastColor('#fff').getLuminance()).toBe(1)
  })

  it('isDark returns true/false for dark/light colors', () => {
    expect(new FastColor('#000').isDark()).toBe(true)
    expect(new FastColor('#111').isDark()).toBe(true)
    expect(new FastColor('#222').isDark()).toBe(true)
    expect(new FastColor('#333').isDark()).toBe(true)
    expect(new FastColor('#444').isDark()).toBe(true)
    expect(new FastColor('#555').isDark()).toBe(true)
    expect(new FastColor('#666').isDark()).toBe(true)
    expect(new FastColor('#777').isDark()).toBe(true)
    expect(new FastColor('#888').isDark()).toBe(false)
    expect(new FastColor('#999').isDark()).toBe(false)
    expect(new FastColor('#aaa').isDark()).toBe(false)
    expect(new FastColor('#bbb').isDark()).toBe(false)
    expect(new FastColor('#ccc').isDark()).toBe(false)
    expect(new FastColor('#ddd').isDark()).toBe(false)
    expect(new FastColor('#eee').isDark()).toBe(false)
    expect(new FastColor('#fff').isDark()).toBe(false)
  })
  it('isLight returns true/false for light/dark colors', () => {
    expect(new FastColor('#000').isLight()).toBe(false)
    expect(new FastColor('#111').isLight()).toBe(false)
    expect(new FastColor('#222').isLight()).toBe(false)
    expect(new FastColor('#333').isLight()).toBe(false)
    expect(new FastColor('#444').isLight()).toBe(false)
    expect(new FastColor('#555').isLight()).toBe(false)
    expect(new FastColor('#666').isLight()).toBe(false)
    expect(new FastColor('#777').isLight()).toBe(false)
    expect(new FastColor('#888').isLight()).toBe(true)
    expect(new FastColor('#999').isLight()).toBe(true)
    expect(new FastColor('#aaa').isLight()).toBe(true)
    expect(new FastColor('#bbb').isLight()).toBe(true)
    expect(new FastColor('#ccc').isLight()).toBe(true)
    expect(new FastColor('#ddd').isLight()).toBe(true)
    expect(new FastColor('#eee').isLight()).toBe(true)
    expect(new FastColor('#fff').isLight()).toBe(true)
  })

  it('color equality', () => {
    expect(new FastColor('#ff0000').equals(new FastColor('#ff0000'))).toBe(
      true,
    )
    expect(new FastColor('#ff0000').equals(new FastColor('rgb(255,0,0)'))).toBe(
      true,
    )
    expect(
      new FastColor('#ff0000').equals(new FastColor('rgba(255,0,0,.1)')),
    ).toBe(false)
    expect(
      new FastColor('#ff000066').equals(new FastColor('rgba(255,0,0,.4)')),
    ).toBe(true)
    expect(
      new FastColor('#f009').equals(new FastColor('rgba(255,0,0,.6)')),
    ).toBe(true)
    expect(new FastColor('#336699CC').equals(new FastColor('#369C'))).toBe(
      true,
    )
    expect(new FastColor('#f00').equals(new FastColor('#ff0000'))).toBe(true)
    expect(new FastColor('#f00').equals(new FastColor('#ff0000'))).toBe(true)
    expect(new FastColor('#ff0000').equals(new FastColor('#00ff00'))).toBe(
      false,
    )
    expect(
      new FastColor('#ff8000').equals(new FastColor('rgb(100%, 50%, 0%)')),
    ).toBe(true)
  })

  it('onBackground', () => {
    expect(
      new FastColor('#ffffff')
        .onBackground(new FastColor('#000'))
        .toHexString(),
    ).toBe('#ffffff')
    expect(
      new FastColor('#ffffff00')
        .onBackground(new FastColor('#000'))
        .toHexString(),
    ).toBe('#000000')
    expect(
      new FastColor('#ffffff77')
        .onBackground(new FastColor('#000'))
        .toHexString(),
    ).toBe('#777777')
    expect(
      new FastColor('#262a6d82')
        .onBackground(new FastColor('#644242'))
        .toHexString(),
    ).toBe('#443658')
    expect(
      new FastColor('rgba(255,0,0,0.5)')
        .onBackground(new FastColor('rgba(0,255,0,0.5)'))
        .toRgbString(),
    ).toBe('rgba(170,85,0,0.75)')
    expect(
      new FastColor('rgba(255,0,0,0.5)')
        .onBackground(new FastColor('rgba(0,0,255,1)'))
        .toRgbString(),
    ).toBe('rgb(128,0,128)')
    expect(
      new FastColor('rgba(0,0,255,1)')
        .onBackground(new FastColor('rgba(0,0,0,0.5)'))
        .toRgbString(),
    ).toBe('rgb(0,0,255)')
  })

  it('default of empty', () => {
    expect(new FastColor('').toRgb()).toEqual({
      r: 0,
      g: 0,
      b: 0,
      a: 1,
    })
  })
})
