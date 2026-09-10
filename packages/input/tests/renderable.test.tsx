import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { BaseInput } from '../src'

describe('baseInput renderable guards', () => {
  it('renders 0 as prefix/suffix/addon content', () => {
    const wrapper = mount(BaseInput, {
      props: {
        prefixCls: 'vc-input',
        prefix: 0,
        suffix: 0,
        addonBefore: 0,
        addonAfter: 0,
      } as any,
      slots: { default: () => <input /> },
    })
    expect(wrapper.find('.vc-input-prefix').text()).toBe('0')
    expect(wrapper.find('.vc-input-suffix').text()).toBe('0')
    expect(wrapper.findAll('.vc-input-group-addon')).toHaveLength(2)
  })

  it('does not render wrappers for empty string content', () => {
    const wrapper = mount(BaseInput, {
      props: { prefixCls: 'vc-input', prefix: '', suffix: '', addonBefore: '' } as any,
      slots: { default: () => <input /> },
    })
    expect(wrapper.find('.vc-input-prefix').exists()).toBe(false)
    expect(wrapper.find('.vc-input-suffix').exists()).toBe(false)
    expect(wrapper.find('.vc-input-group-addon').exists()).toBe(false)
  })
})
