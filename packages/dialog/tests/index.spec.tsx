import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import Dialog from '../src'

async function flushDialog() {
  await nextTick()
  vi.runAllTimers()
  await nextTick()
  await nextTick()
}

describe('@v-c/dialog', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    document.body.innerHTML = ''
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('applies rootStyle to the root node', async () => {
    const wrapper = mount(Dialog, {
      props: {
        visible: true,
        getContainer: false,
        rootStyle: {
          fontSize: '18px',
        },
      },
    })

    await flushDialog()

    expect(wrapper.find('.vc-dialog-root').attributes('style')).toContain('font-size: 18px;')
  })

  it('calls afterOpenChange for both open and close', async () => {
    const afterOpenChange = vi.fn()
    const wrapper = mount(Dialog, {
      props: {
        visible: false,
        getContainer: false,
        afterOpenChange,
      },
    })

    await flushDialog()

    await wrapper.setProps({ visible: true })
    await flushDialog()

    await wrapper.setProps({ visible: false })
    await flushDialog()

    expect(afterOpenChange.mock.calls).toEqual([[true], [false]])
  })

  it('does not close when wrapper receives click without mask mousedown', async () => {
    const onClose = vi.fn()
    const wrapper = mount(Dialog, {
      props: {
        visible: true,
        getContainer: false,
        onClose,
      },
      slots: {
        default: () => <div>content</div>,
      },
    })

    await flushDialog()

    await wrapper.find('.vc-dialog-wrap').trigger('click')

    expect(onClose).not.toHaveBeenCalled()
  })

  it('supports semantic close classNames and styles', async () => {
    const wrapper = mount(Dialog, {
      props: {
        visible: true,
        getContainer: false,
        classNames: {
          close: 'custom-close',
        },
        styles: {
          close: {
            color: 'rgb(255, 0, 0)',
          },
        },
      },
    })

    await flushDialog()

    const closeButton = wrapper.find('.vc-dialog-close')

    expect(closeButton.classes()).toContain('custom-close')
    expect(closeButton.attributes('style')).toContain('color: rgb(255, 0, 0);')
  })

  it('calls closable.afterClose before dialog afterClose', async () => {
    const closableAfterClose = vi.fn()
    const afterClose = vi.fn()
    const wrapper = mount(Dialog, {
      props: {
        visible: true,
        getContainer: false,
        closable: {
          afterClose: closableAfterClose,
        },
        afterClose,
      },
    })

    await flushDialog()

    await wrapper.setProps({ visible: false })
    await flushDialog()

    expect(closableAfterClose).toHaveBeenCalledTimes(1)
    expect(afterClose).toHaveBeenCalledTimes(1)
    expect(closableAfterClose.mock.invocationCallOrder[0]).toBeLessThan(afterClose.mock.invocationCallOrder[0])
  })
})
