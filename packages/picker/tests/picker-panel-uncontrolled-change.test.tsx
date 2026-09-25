import { mount } from '@vue/test-utils'
import dayjs from 'dayjs'
import { describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { PickerPanel } from '../src'
import generateConfig from '../src/generate/dayjs'
import enUS from '../src/locale/en_US'

async function flush() {
  for (let i = 0; i < 4; i += 1) {
    await nextTick()
  }
}

describe('uncontrolled PickerPanel onChange', () => {
  it('fires onChange when a new time is selected', async () => {
    const onChange = vi.fn()
    const wrapper = mount(PickerPanel as any, {
      attachTo: document.body,
      props: {
        generateConfig,
        locale: enUS,
        picker: 'time',
        defaultValue: dayjs('1990-09-03 05:00:00'),
        onChange,
      },
    })
    await flush()

    document.querySelector<HTMLElement>('.vc-picker-time-panel-column li[data-value="10"]')!.click()
    await flush()

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange.mock.calls[0]![0].format('HH:mm:ss')).toBe('10:00:00')

    wrapper.unmount()
  })

  // `picker` is omitted on purpose: it defaults to `date`
  it('fires onChange when a date is selected', async () => {
    const onChange = vi.fn()
    const wrapper = mount(PickerPanel as any, {
      attachTo: document.body,
      props: {
        generateConfig,
        locale: enUS,
        defaultValue: dayjs('1990-09-03'),
        onChange,
      },
    })
    await flush()

    document.querySelector<HTMLElement>('td[title="1990-09-10"]')!.click()
    await flush()

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange.mock.calls[0]![0].format('YYYY-MM-DD')).toBe('1990-09-10')

    wrapper.unmount()
  })
})
