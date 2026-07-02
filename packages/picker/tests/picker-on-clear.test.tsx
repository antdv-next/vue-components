import { mount } from '@vue/test-utils'
import dayjs from 'dayjs'
import { describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import Picker from '../src'
import generateConfig from '../src/generate/dayjs'
import enUS from '../src/locale/en_US'

// sync ant-design#58403 / rc-picker: public `onClear` callback fires on clear
describe('Picker onClear', () => {
  it('fires onClear when the clear icon is clicked', async () => {
    const onClear = vi.fn()
    const wrapper = mount(Picker as any, {
      attachTo: document.body,
      props: {
        generateConfig,
        locale: enUS,
        value: dayjs('2026-02-23'),
        allowClear: { clearIcon: 'x' },
        onClear,
      },
    })
    await nextTick()

    const clearBtn = wrapper.find('.vc-picker-clear')
    expect(clearBtn.exists()).toBe(true)

    await clearBtn.trigger('mousedown')
    await clearBtn.trigger('click')
    await nextTick()

    expect(onClear).toHaveBeenCalledTimes(1)
    expect((wrapper.find('input').element as HTMLInputElement).value).toBe('')

    wrapper.unmount()
  })
})
