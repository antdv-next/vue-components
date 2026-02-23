import { mount } from '@vue/test-utils'
import dayjs from 'dayjs'
import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import Picker from '../src'
import generateConfig from '../src/generate/dayjs'
import enUS from '../src/locale/en_US'

describe('Picker controlled value', () => {
  it('clears displayed text when value becomes undefined', async () => {
    const wrapper = mount(Picker as any, {
      attachTo: document.body,
      props: {
        generateConfig,
        locale: enUS,
        showTime: true,
        format: 'YYYY-MM-DD HH:mm:ss',
        value: dayjs('2026-02-23 10:00:00'),
      },
    })

    const input = wrapper.find('input')
    expect((input.element as HTMLInputElement).value).toBe('2026-02-23 10:00:00')

    await wrapper.setProps({
      value: undefined,
    })
    await nextTick()

    expect((wrapper.find('input').element as HTMLInputElement).value).toBe('')

    wrapper.unmount()
  })
})
