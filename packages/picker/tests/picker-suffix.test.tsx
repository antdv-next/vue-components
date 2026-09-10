import { resetWarned } from '@v-c/util/dist/warning'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { h, nextTick } from 'vue'
import Picker, { RangePicker } from '../src'
import generateConfig from '../src/generate/dayjs'
import enUS from '../src/locale/en_US'
import zhTW from '../src/locale/zh_TW'

function mountPicker(props: Record<string, any> = {}, component: any = Picker) {
  return mount(component, {
    attachTo: document.body,
    props: {
      generateConfig,
      locale: enUS,
      ...props,
    },
  })
}

// sync rc-picker #1014: `suffix` replaces `suffixIcon` (kept as a deprecated alias)
describe('picker suffix', () => {
  let errorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    resetWarned()
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    errorSpy.mockRestore()
  })

  it('renders suffix in the single picker', async () => {
    const wrapper = mountPicker({ suffix: h('span', { class: 'new-suffix' }) })
    await nextTick()

    expect(wrapper.find('.vc-picker-suffix .new-suffix').exists()).toBe(true)
    expect(errorSpy).not.toHaveBeenCalled()

    wrapper.unmount()
  })

  it('renders suffix in the range picker', async () => {
    const wrapper = mountPicker({ suffix: h('span', { class: 'new-suffix' }) }, RangePicker)
    await nextTick()

    expect(wrapper.find('.vc-picker-suffix .new-suffix').exists()).toBe(true)

    wrapper.unmount()
  })

  it('supports legacy suffixIcon and prefers suffix', async () => {
    const wrapper = mountPicker({ suffixIcon: h('span', { class: 'legacy-suffix' }) })
    await nextTick()

    expect(wrapper.find('.legacy-suffix').exists()).toBe(true)
    expect(errorSpy).toHaveBeenCalledWith(
      'Warning: `suffixIcon` is deprecated. Please use `suffix` instead.',
    )

    await wrapper.setProps({
      suffix: h('span', { class: 'new-suffix' }),
      suffixIcon: h('span', { class: 'legacy-suffix' }),
    })
    await nextTick()

    expect(wrapper.find('.new-suffix').exists()).toBe(true)
    expect(wrapper.find('.legacy-suffix').exists()).toBe(false)

    wrapper.unmount()
  })

  // sync rc-picker #1009: renderable guards keep `0` visible and skip `''`
  it('treats 0 as renderable and empty string as empty', async () => {
    const wrapper = mountPicker({ suffix: 0, prefix: '' })
    await nextTick()

    expect(wrapper.find('.vc-picker-suffix').text()).toBe('0')
    expect(wrapper.find('.vc-picker-prefix').exists()).toBe(false)

    wrapper.unmount()
  })
})

// sync rc-picker #1007
describe('zh_TW locale', () => {
  it('uses Taiwan week terminology', () => {
    expect(zhTW.weekSelect).toBe('選擇週')
    expect(zhTW.week).toBe('週')
  })
})
