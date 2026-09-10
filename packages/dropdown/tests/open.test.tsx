import { resetWarned } from '@v-c/util/dist/warning'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick } from 'vue'
import Dropdown from '../src'

/** Let the portal mount and the align pass settle. */
async function settle() {
  for (let i = 0; i < 6; i += 1) {
    await nextTick()
  }
  await new Promise(resolve => setTimeout(resolve, 50))
}

function popupOpen() {
  const popup = document.querySelector('.vc-dropdown')
  return !!popup && !popup.classList.contains('vc-dropdown-hidden')
}

function mountDropdown(props: Record<string, any> = {}) {
  return mount(
    defineComponent({
      setup() {
        return () => (
          <Dropdown overlay={<div class="menu">menu</div>} {...props}>
            <button class="target">open</button>
          </Dropdown>
        )
      },
    }),
    { attachTo: document.body },
  )
}

describe('dropdown open API', () => {
  let errorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    resetWarned()
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    errorSpy.mockRestore()
    document.body.innerHTML = ''
  })

  it('controls the popup with `open`', async () => {
    const wrapper = mountDropdown({ open: true })
    await settle()

    expect(popupOpen()).toBe(true)
    expect(wrapper.find('.target').classes()).toContain('vc-dropdown-open')
    expect(errorSpy).not.toHaveBeenCalled()

    wrapper.unmount()
  })

  it('calls `onOpenChange` when the trigger toggles the popup', async () => {
    const onOpenChange = vi.fn()
    const wrapper = mountDropdown({ trigger: ['click'], onOpenChange })

    await wrapper.find('.target').trigger('click')
    await settle()

    expect(onOpenChange).toHaveBeenCalledWith(true)
    expect(popupOpen()).toBe(true)
    expect(errorSpy).not.toHaveBeenCalled()

    wrapper.unmount()
  })

  it('still supports the deprecated `visible` prop with a warning', async () => {
    const wrapper = mountDropdown({ visible: true })
    await settle()

    expect(popupOpen()).toBe(true)
    expect(errorSpy).toHaveBeenCalledWith(
      'Warning: `visible` is deprecated. Please use `open` instead.',
    )

    wrapper.unmount()
  })

  it('still calls the deprecated `onVisibleChange` with a warning', async () => {
    const onVisibleChange = vi.fn()
    const onOpenChange = vi.fn()
    const wrapper = mountDropdown({ trigger: ['click'], onVisibleChange, onOpenChange })

    await wrapper.find('.target').trigger('click')
    await settle()

    expect(onOpenChange).toHaveBeenCalledWith(true)
    expect(onVisibleChange).toHaveBeenCalledWith(true)
    expect(errorSpy).toHaveBeenCalledWith(
      'Warning: `onVisibleChange` is deprecated. Please use `onOpenChange` instead.',
    )

    wrapper.unmount()
  })

  it('prefers `open` over `visible` when both are passed', async () => {
    const wrapper = mountDropdown({ open: false, visible: true })
    await settle()

    expect(popupOpen()).toBe(false)

    wrapper.unmount()
  })

  it('closes and reports via `onOpenChange` on ESC', async () => {
    const onOpenChange = vi.fn()
    const wrapper = mountDropdown({ open: true, onOpenChange })
    await settle()

    window.dispatchEvent(new KeyboardEvent('keydown', { keyCode: 27 } as any))
    await nextTick()

    expect(onOpenChange).toHaveBeenCalledWith(false)

    wrapper.unmount()
  })
})
