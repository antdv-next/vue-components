import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Input from '../src'

// ref: react-component/input#205
describe('input suffix renderability', () => {
  it('renders a zero suffix and applies the count suffix class', async () => {
    const wrapper = mount(Input, { props: { suffix: 0 } as any })
    expect(wrapper.find('.vc-input-suffix').exists()).toBe(true)
    expect(wrapper.find('.vc-input-suffix').text()).toBe('0')
    await wrapper.setProps({ showCount: true } as any)
    expect(wrapper.find('.vc-input-show-count-has-suffix').exists()).toBe(true)
  })

  it.each([null, undefined, false, ''])('does not wrap an empty suffix %s', (suffix) => {
    const wrapper = mount(Input, { props: { suffix } as any })
    expect(wrapper.find('.vc-input-suffix').exists()).toBe(false)
  })
})
