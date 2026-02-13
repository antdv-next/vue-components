/** @vitest-environment jsdom */

import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import Rate from '../src'

describe('rate star character node', () => {
  it('clones vnode character for all stars', () => {
    const wrapper = mount(Rate, {
      props: {
        count: 5,
        character: h('span', { class: 'char-vnode' }, 'x'),
      },
    })

    expect(wrapper.findAll('.char-vnode')).toHaveLength(10)
  })

  it('clones function returned vnode for first and second star layers', () => {
    const wrapper = mount(Rate, {
      props: {
        count: 5,
        character: () => h('span', { class: 'char-fn' }, 'x'),
      },
    })

    expect(wrapper.findAll('.char-fn')).toHaveLength(10)
  })
})
