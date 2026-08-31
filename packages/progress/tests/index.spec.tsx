// @vitest-environment jsdom

import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { Circle, Line } from '../src'

describe('progress semantics', () => {
  it.each([
    ['line', Line, '.vc-progress-line-rail'],
    ['circle', Circle, '.vc-progress-circle-rail'],
  ])('honors zero rail width for %s progress', (_, Component, railSelector) => {
    const wrapper = mount(Component, {
      props: {
        prefixCls: 'vc-progress',
        percent: 50,
        railWidth: 0,
        strokeWidth: 2,
      },
    })

    expect(wrapper.find(railSelector).attributes('stroke-width')).toBe('0')
  })

  it('forwards accessible SVG attributes to line progress', () => {
    const wrapper = mount(Line, {
      props: {
        id: 'upload-progress',
        prefixCls: 'vc-progress',
        percent: 50,
      },
      attrs: {
        'aria-label': 'Upload progress',
      },
    })

    expect(wrapper.attributes()).toMatchObject({
      'aria-label': 'Upload progress',
      'id': 'upload-progress',
      'role': 'presentation',
    })
  })
})
