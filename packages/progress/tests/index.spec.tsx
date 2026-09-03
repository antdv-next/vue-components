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

  it('uses presentational semantics for decorative progress', () => {
    const wrapper = mount(Line, {
      props: {
        prefixCls: 'vc-progress',
        percent: 50,
      },
    })

    expect(wrapper.attributes('role')).toBe('presentation')
  })

  it.each([
    ['line', Line],
    ['circle', Circle],
  ])('forwards explicit accessible SVG semantics to %s progress', (_, Component) => {
    const wrapper = mount(Component, {
      props: {
        id: 'upload-progress',
        prefixCls: 'vc-progress',
        percent: 50,
      },
      attrs: {
        'aria-label': 'Upload progress',
        'aria-valuemax': '100',
        'aria-valuemin': '0',
        'aria-valuenow': '50',
        'role': 'progressbar',
      },
    })

    expect(wrapper.attributes()).toMatchObject({
      'aria-label': 'Upload progress',
      'aria-valuemax': '100',
      'aria-valuemin': '0',
      'aria-valuenow': '50',
      'id': 'upload-progress',
      'role': 'progressbar',
    })
  })
})
