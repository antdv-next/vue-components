import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import Dialog from '../src'

describe('@v-c/dialog renderable guards', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('renders 0 as title and footer', () => {
    const wrapper = mount(Dialog, {
      attachTo: document.body,
      props: { visible: true, getContainer: false, title: 0, footer: 0 } as any,
    })
    expect(wrapper.find('.vc-dialog-title').text()).toBe('0')
    expect(wrapper.find('.vc-dialog-footer').text()).toBe('0')
    expect(wrapper.find('[role="dialog"]').attributes('aria-labelledby')).toBeTruthy()
    wrapper.unmount()
  })

  it('skips header for empty string title', () => {
    const wrapper = mount(Dialog, {
      attachTo: document.body,
      props: { visible: true, getContainer: false, title: '' } as any,
    })
    expect(wrapper.find('.vc-dialog-header').exists()).toBe(false)
    expect(wrapper.find('[role="dialog"]').attributes('aria-labelledby')).toBeUndefined()
    wrapper.unmount()
  })
})
