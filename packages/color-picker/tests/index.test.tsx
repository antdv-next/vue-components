import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ColorPicker from '../src'

describe('color-picker', () => {
  it('should component render correct', () => {
    const wrapper = mount(() => <ColorPicker />)
    expect(wrapper.classes()).toContain('vc-color-picker-panel')
  })
})
