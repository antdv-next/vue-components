import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import Trigger from '../../trigger/src'
import motionProps from '../docs/assets/motion.ts'
import Drawer from '../src'

Object.defineProperty(window, 'getComputedStyle', {
  value: () => ({
    getPropertyValue: () => '',
    overflow: 'hidden',
  }),
})
describe('vc-drawer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('single drawer', async () => {
    const onClose = vi.fn()
    const wrapper = mount(Drawer, {
      props: {
        open: true,
        rootClassName: 'test-drawer',
        getContainer: false,
        onClose,
        placement: 'right',
        width: 378,
        mask: true,
        maskClosable: true,
        ...motionProps,
      },
    })
    await nextTick()
    expect(wrapper.find('.vc-drawer').exists()).toBeTruthy()
    expect(wrapper.find('.vc-drawer-open').exists()).toBeTruthy()
    // expect(wrapper.find('.vc-drawer').element.parentElement === document.body).toBeTruthy()
    wrapper.unmount()
    await nextTick()
  })

  it('reports drawer sizes when resize starts and ends', async () => {
    const onResizeStart = vi.fn()
    const onResizeEnd = vi.fn()
    const wrapper = mount(Drawer, {
      props: {
        open: true,
        getContainer: false,
        placement: 'right',
        defaultSize: 320,
        resizable: {
          onResizeStart,
          onResizeEnd,
        },
        ...motionProps,
      },
    })

    await nextTick()
    const contentWrapper = wrapper.find('.vc-drawer-content-wrapper').element as HTMLElement
    contentWrapper.getBoundingClientRect = vi.fn(() => ({
      width: 360,
      height: 0,
    } as DOMRect))

    await wrapper.find('.vc-drawer-resizable-dragger').trigger('mousedown', { clientX: 100 })
    await nextTick()
    document.dispatchEvent(new MouseEvent('mouseup'))

    expect(onResizeStart).toHaveBeenCalledWith(320)
    expect(onResizeEnd).toHaveBeenCalledWith(360)

    wrapper.unmount()
    await nextTick()
  })

  it('closes on Escape when getContainer is false', async () => {
    const onClose = vi.fn()
    const wrapper = mount(Drawer, {
      attachTo: document.body,
      props: {
        open: true,
        getContainer: false,
        onClose,
        ...motionProps,
      },
    })

    await nextTick()

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await nextTick()

    expect(onClose).toHaveBeenCalledTimes(1)

    wrapper.unmount()
    await nextTick()
  })

  it('switch open drawer', async () => {
    const onClose = vi.fn()
    const afterOpenChange = vi.fn()
    const wrapper = mount(Drawer, {
      props: {
        getContainer: false,
        onClose,
        afterOpenChange,
        placement: 'right',
        width: 378,
        mask: true,
        maskClosable: true,
        ...motionProps,
        open: false,
      },
    })
    await nextTick()
    expect(wrapper.find('.vc-drawer').exists()).toBeFalsy()
    await wrapper.setProps({ open: true })
    vi.runAllTimers()
    await nextTick()
    expect(wrapper.find('.vc-drawer').exists()).toBeTruthy()
    await wrapper.setProps({ open: false })
    vi.runAllTimers()
    await nextTick()
    expect(wrapper.find('.vc-drawer-content-wrapper').exists()).toBeTruthy()
    expect(wrapper.find('.vc-drawer-content-wrapper').attributes('style')).toContain('display: none')
    wrapper.unmount()
    await nextTick()
  })

  it('keeps focus on a body-mounted popup input', async () => {
    const wrapper = mount(Drawer, {
      attachTo: document.body,
      props: {
        open: true,
        getContainer: false,
        placement: 'right',
        width: 378,
        mask: true,
        maskClosable: true,
        ...motionProps,
      },
      slots: {
        default: () => (
          <Trigger
            popupVisible
            popup={<input id="drawer-portal-input" />}
          >
            <button id="drawer-trigger" type="button">
              trigger
            </button>
          </Trigger>
        ),
      },
    })

    await nextTick()
    await nextTick()

    const popupInput = document.getElementById('drawer-portal-input') as HTMLInputElement | null
    const drawerElement = document.querySelector('.vc-drawer')

    expect(popupInput).not.toBeNull()
    expect(drawerElement?.contains(popupInput!)).toBe(false)

    popupInput!.focus()
    await nextTick()

    expect(document.activeElement).toBe(popupInput)

    wrapper.unmount()
    await nextTick()
  })
})
