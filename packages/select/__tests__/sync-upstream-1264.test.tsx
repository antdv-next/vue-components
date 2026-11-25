import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Select from '../src'

// react-component/select#1264
describe('search input autocomplete default', () => {
  it('defaults autocomplete to off', () => {
    const wrapper = mount(Select, { props: { showSearch: true } })
    expect(wrapper.find('input').attributes('autocomplete')).toBe('off')
    wrapper.unmount()
  })

  it('still respects an explicit autoComplete', () => {
    const wrapper = mount(Select, { props: { showSearch: true, autoComplete: 'new-password' } })
    expect(wrapper.find('input').attributes('autocomplete')).toBe('new-password')
    wrapper.unmount()
  })
})
