import { describe, expect, it } from 'vitest'
import { Color } from '../src'

describe('colorPicker.Color', () => {
  it('not break of color', () => {
    const oriColor = new Color('#FF0000')
    const nextColor = new Color(oriColor)

    expect(oriColor.toHexString()).toEqual(nextColor.toHexString())
  })
})
