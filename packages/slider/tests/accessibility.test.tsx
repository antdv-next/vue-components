// @vitest-environment jsdom

import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Slider from '../src'

describe('slider accessibility', () => {
  it('applies aria-describedby to a single handle', () => {
    const wrapper = mount(Slider, {
      props: {
        ariaDescribedByForHandle: 'value-help',
      },
    })

    expect(wrapper.get('[role="slider"]').attributes('aria-describedby')).toBe('value-help')
  })

  it('applies aria-describedby to each handle', () => {
    const wrapper = mount(Slider, {
      props: {
        range: true,
        defaultValue: [20, 80],
        ariaDescribedByForHandle: ['minimum-help', 'maximum-help'],
      },
    })

    const handles = wrapper.findAll('[role="slider"]')
    expect(handles[0].attributes('aria-describedby')).toBe('minimum-help')
    expect(handles[1].attributes('aria-describedby')).toBe('maximum-help')
  })
})
