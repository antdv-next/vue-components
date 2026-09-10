import { mount } from '@vue/test-utils'
import dayjs from 'dayjs'
import { describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import Picker from '../src'
import generateConfig from '../src/generate/dayjs'
import enUS from '../src/locale/en_US'

async function flush() {
  for (let i = 0; i < 4; i += 1) {
    await nextTick()
  }
  await new Promise(resolve => setTimeout(resolve))
}

// sync rc-picker #1012: a navigation button that becomes disabled after click
// loses focus. The picker must move focus back to the panel instead of
// treating it as an outside blur (which would close the popup).
describe('picker focus at navigation boundaries', () => {
  it('keeps open when a disabled navigation button blurs', async () => {
    const onBlur = vi.fn()
    const onOpenChange = vi.fn()
    const wrapper = mount(Picker as any, {
      attachTo: document.body,
      props: {
        generateConfig,
        locale: enUS,
        defaultPickerValue: dayjs('2019-09-03'),
        minDate: dayjs('2019-08-01'),
        open: true,
        onBlur,
        onOpenChange,
      },
    })
    await flush()

    const prevButton = document.querySelector<HTMLButtonElement>('.vc-picker-header-prev-btn')!
    const panelContainer = document.querySelector<HTMLElement>('.vc-picker-panel-container')!
    expect(prevButton).toBeTruthy()
    expect(panelContainer).toBeTruthy()

    // Focus the button through the panel container (focusin bubbles) and
    // navigate to the boundary month so the button becomes disabled.
    prevButton.dispatchEvent(new FocusEvent('focusin', { bubbles: true }))
    prevButton.click()
    await flush()
    expect(prevButton.disabled).toBe(true)

    prevButton.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: null }))
    await flush()

    expect(onBlur).toHaveBeenCalled()
    expect(document.activeElement).toBe(panelContainer)
    expect(onOpenChange).not.toHaveBeenCalledWith(false)

    wrapper.unmount()
  })
})
