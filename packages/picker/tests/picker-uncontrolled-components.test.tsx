import { mount } from '@vue/test-utils'
import dayjs from 'dayjs'
import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import Picker, { RangePicker } from '../src'
import generateConfig from '../src/generate/dayjs'
import enUS from '../src/locale/en_US'

describe('Picker uncontrolled components', () => {
  it('SinglePicker clears internal value by clear button', async () => {
    const wrapper = mount(Picker as any, {
      attachTo: document.body,
      props: {
        generateConfig,
        locale: enUS,
        allowClear: true,
        format: 'YYYY-MM-DD',
        defaultValue: dayjs('2026-02-23'),
      },
    })

    expect((wrapper.find('input').element as HTMLInputElement).value).toBe('2026-02-23')

    await wrapper.find('.vc-picker-clear').trigger('click')
    await nextTick()

    expect((wrapper.find('input').element as HTMLInputElement).value).toBe('')

    wrapper.unmount()
  })

  it('RangePicker clears internal values by clear button', async () => {
    const wrapper = mount(RangePicker as any, {
      attachTo: document.body,
      props: {
        generateConfig,
        locale: enUS,
        allowClear: true,
        format: 'YYYY-MM-DD',
        defaultValue: [dayjs('2026-02-23'), dayjs('2026-02-24')],
      },
    })

    const inputs = wrapper.findAll('input')
    expect((inputs[0].element as HTMLInputElement).value).toBe('2026-02-23')
    expect((inputs[1].element as HTMLInputElement).value).toBe('2026-02-24')

    await wrapper.find('.vc-picker-clear').trigger('click')
    await nextTick()

    const clearedInputs = wrapper.findAll('input')
    expect((clearedInputs[0].element as HTMLInputElement).value).toBe('')
    expect((clearedInputs[1].element as HTMLInputElement).value).toBe('')

    wrapper.unmount()
  })
})
