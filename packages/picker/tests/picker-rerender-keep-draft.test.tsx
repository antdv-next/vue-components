import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import Picker from '../src'
import generateConfig from '../src/generate/dayjs'
import enUS from '../src/locale/en_US'

// https://github.com/antdv-next/antdv-next/issues/597
// When a parent (e.g. FormItem) re-renders and passes an equivalent-but-new
// `showTime` object / `value`, the parsed value list must keep its reference,
// otherwise `useInnerValue` resets the in-panel draft selection and the
// confirm (OK) flow breaks.
describe('picker re-render keeps draft selection', () => {
  it('does not reset calendar draft when equivalent props are re-passed', async () => {
    const wrapper = mount(Picker as any, {
      attachTo: document.body,
      props: {
        generateConfig,
        locale: enUS,
        showTime: { format: 'HH:mm:ss' },
        format: 'YYYY-MM-DD HH:mm:ss',
        valueFormat: 'YYYY-MM-DD HH:mm:ss',
        value: '',
        open: true,
      },
    })
    await nextTick()

    // Select a date in the panel: with showTime this only updates the draft
    // (calendarValue) and waits for OK confirm. The popup renders in a portal,
    // so query through document instead of the wrapper.
    const cell = Array.from(document.querySelectorAll('.vc-picker-cell-in-view'))
      .find(c => c.querySelector('.vc-picker-cell-inner')?.textContent === '15') as HTMLElement
    cell.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await nextTick()

    const input = wrapper.find('input').element as HTMLInputElement
    expect(input.value).not.toBe('')
    const draftText = input.value

    // Parent re-render: same content, new object identity for `showTime`.
    await wrapper.setProps({ showTime: { format: 'HH:mm:ss' }, value: '' })
    await nextTick()

    // Draft must survive, OK button must stay enabled.
    expect((wrapper.find('input').element as HTMLInputElement).value).toBe(draftText)
    const okBtn = document.querySelector('.vc-picker-ok button') as HTMLButtonElement
    expect(okBtn.disabled).toBe(false)

    wrapper.unmount()
  })
})
