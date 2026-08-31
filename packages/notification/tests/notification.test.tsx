import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import Notifications from '../src/Notifications'

describe('notification', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('calls close callbacks once when notice close button is clicked', async () => {
    const onClose = vi.fn()
    const closableOnClose = vi.fn()
    const wrapper = mount(Notifications, {
      props: {
        container: document.body,
      },
      attachTo: document.body,
    })

    wrapper.vm.open({
      key: 'notice',
      title: 'Notice',
      duration: false,
      closable: {
        closeIcon: 'x',
        onClose: closableOnClose,
      },
      onClose,
    })

    await nextTick()
    await nextTick()
    await document.querySelector<HTMLButtonElement>('.vc-notification-notice-close')!.click()
    await nextTick()

    expect(closableOnClose).toHaveBeenCalledTimes(1)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('renders the close control as a non-submit button', async () => {
    const wrapper = mount(Notifications, {
      props: {
        container: document.body,
      },
      attachTo: document.body,
    })

    wrapper.vm.open({
      key: 'notice',
      title: 'Notice',
      duration: false,
      closable: true,
    })

    await nextTick()
    await nextTick()

    expect(document.querySelector<HTMLButtonElement>('.vc-notification-notice-close')?.type)
      .toBe('button')
  })

  it('does not call notice close callbacks when closed by api', async () => {
    const onClose = vi.fn()
    const closableOnClose = vi.fn()
    const wrapper = mount(Notifications, {
      props: {
        container: document.body,
      },
      attachTo: document.body,
    })

    wrapper.vm.open({
      key: 'notice',
      title: 'Notice',
      duration: false,
      closable: {
        closeIcon: 'x',
        onClose: closableOnClose,
      },
      onClose,
    })

    await nextTick()
    await nextTick()
    wrapper.vm.close('notice')
    await nextTick()

    expect(closableOnClose).not.toHaveBeenCalled()
    expect(onClose).not.toHaveBeenCalled()
  })
})
