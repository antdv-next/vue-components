import { mount } from '@vue/test-utils'
import dayjs from 'dayjs'
import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { RangePicker } from '../src'
import generateConfig from '../src/generate/dayjs'
import enUS from '../src/locale/en_US'

async function flush() {
  for (let i = 0; i < 4; i += 1) {
    await nextTick()
  }
  await new Promise(resolve => setTimeout(resolve))
}

function mountRange(props: Record<string, any> = {}) {
  return mount(RangePicker as any, {
    attachTo: document.body,
    props: {
      generateConfig,
      locale: enUS,
      defaultPickerValue: [dayjs('2026-09-03'), dayjs('2026-09-03')],
      showTime: true,
      open: true,
      ...props,
    },
  })
}

function findCell(text: string) {
  return Array.from(document.querySelectorAll<HTMLElement>('.vc-picker-cell-in-view'))
    .find(cell => cell.querySelector('.vc-picker-cell-inner')?.textContent === text)!
}

async function selectCell(text: string) {
  findCell(text).dispatchEvent(new MouseEvent('click', { bubbles: true }))
  await flush()
}

async function hoverCell(text: string) {
  findCell(text).dispatchEvent(new MouseEvent('mouseenter'))
  await flush()
}

// sync rc-picker #1010: hovering another cell while the first field is still
// pending must keep the pending selection highlighted instead of previewing a
// range starting from the hovered cell.
describe('rangePicker pending selection hover', () => {
  it.each([true, false])(
    'keeps the pending selection when hovering with needConfirm=%s',
    async (needConfirm) => {
      const wrapper = mountRange({ needConfirm })
      await flush()

      await selectCell('11')
      expect(findCell('11').classList.contains('vc-picker-cell-range-start')).toBe(true)

      await hoverCell('22')

      expect((wrapper.findAll('input')[0].element as HTMLInputElement).value).toBe('2026-09-22 00:00:00')
      expect(findCell('11').classList.contains('vc-picker-cell-selected')).toBe(true)
      expect(findCell('11').classList.contains('vc-picker-cell-range-start')).toBe(false)
      expect(findCell('22').classList.contains('vc-picker-cell-hover')).toBe(true)
      expect(findCell('22').classList.contains('vc-picker-cell-range-start')).toBe(false)

      wrapper.unmount()
    },
  )

  it('keeps range hover after the first field is confirmed', async () => {
    const wrapper = mountRange()
    await flush()

    await selectCell('11')
    document.querySelector<HTMLButtonElement>('.vc-picker-ok button')!.click()
    await flush()

    await selectCell('22')
    await hoverCell('25')

    expect(findCell('11').classList.contains('vc-picker-cell-range-start')).toBe(true)
    expect(findCell('15').classList.contains('vc-picker-cell-in-range')).toBe(true)
    expect(findCell('25').classList.contains('vc-picker-cell-range-end')).toBe(true)

    wrapper.unmount()
  })
})
