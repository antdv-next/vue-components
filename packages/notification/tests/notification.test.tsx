import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import Notification from '../src/Notification'
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

describe('notification stack hover', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(
      cb => setTimeout(() => cb(0), 16) as any,
    )
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(id =>
      clearTimeout(id as any),
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
    document.body.innerHTML = ''
    vi.useRealTimers()
  })

  it('does not shorten the duration when a paused notice is re-paused', async () => {
    const onClose = vi.fn()
    const wrapper = mount(Notification, {
      props: {
        prefixCls: 'vc-notification',
        duration: 1,
        onClose,
      },
    })

    const notice = wrapper.find('.vc-notification-notice')
    // mouseenter pauses directly; the list hovering watcher pauses again.
    await notice.trigger('mouseenter')
    await wrapper.setProps({ hovering: true })
    await vi.advanceTimersByTimeAsync(2000)

    // Leaving the notice and then the list resumes through the watcher.
    await notice.trigger('mouseleave')
    await wrapper.setProps({ hovering: false })

    expect(onClose).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(2000)
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})

describe('notification unmount', () => {
  it.each(['hovered', 'never hovered', 'already left'])(
    'only calls leave when still hovered: %s',
    async (state) => {
      const onMouseLeave = vi.fn()
      const wrapper = mount(Notification, {
        props: {
          prefixCls: 'vc-notification',
          duration: 0,
          onMouseLeave,
        },
      })
      const notice = wrapper.find('.vc-notification-notice')

      if (state !== 'never hovered') {
        await notice.trigger('mouseenter')
      }
      if (state === 'already left') {
        await notice.trigger('mouseleave')
        expect(onMouseLeave).toHaveBeenCalledTimes(1)
        onMouseLeave.mockClear()
      }

      wrapper.unmount()
      expect(onMouseLeave).toHaveBeenCalledTimes(state === 'hovered' ? 1 : 0)
      if (state === 'hovered') {
        expect(onMouseLeave).toHaveBeenCalledWith(undefined)
      }
    },
  )
})

describe('notification stack', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  async function openNotices(count: number, closable = false) {
    const wrapper = mount(Notifications, {
      props: {
        container: document.body,
        stack: { threshold: 3 },
      },
      attachTo: document.body,
    })
    for (let i = 0; i < count; i += 1) {
      wrapper.vm.open({
        key: `notice-${i}`,
        description: 'Test',
        duration: false,
        closable,
      })
    }
    await nextTick()
    await nextTick()
    return wrapper
  }

  const fire = async (selector: string, type: 'mouseenter' | 'mouseleave') => {
    document.querySelector(selector)!.dispatchEvent(new MouseEvent(type))
    await nextTick()
  }

  it('expands only when hovering the list content', async () => {
    await openNotices(5)
    expect(document.querySelectorAll('.vc-notification-notice')).toHaveLength(5)
    expect(document.querySelector('.vc-notification-stack')).toBeTruthy()
    expect(document.querySelector('.vc-notification-stack-expanded')).toBeFalsy()

    await fire('.vc-notification-list', 'mouseenter')
    expect(document.querySelector('.vc-notification-stack-expanded')).toBeFalsy()

    await fire('.vc-notification-list-content', 'mouseenter')
    expect(document.querySelector('.vc-notification-stack-expanded')).toBeTruthy()

    await fire('.vc-notification-list-content', 'mouseleave')
    expect(document.querySelector('.vc-notification-stack-expanded')).toBeFalsy()
  })
})
