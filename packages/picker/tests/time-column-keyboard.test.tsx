import { mount } from '@vue/test-utils'
import dayjs from 'dayjs'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { PickerPanel } from '../src'
import generateConfig from '../src/generate/dayjs'
import enUS from '../src/locale/en_US'
import zhCN from '../src/locale/zh_CN'

// sync rc-picker #987: Time panel keyboard navigation and semantics

async function flush() {
  for (let i = 0; i < 4; i += 1) {
    await nextTick()
  }
}

function renderTimePanel(props: Record<string, any> = {}) {
  return mount(PickerPanel as any, {
    attachTo: document.body,
    props: {
      generateConfig,
      locale: enUS,
      picker: 'time',
      ...props,
    },
  })
}

function getColumn(index = 0) {
  return document.querySelectorAll<HTMLUListElement>('.vc-picker-time-panel-column')[index]!
}

function getCell(value: number | string, columnIndex = 0) {
  return getColumn(columnIndex).querySelector<HTMLLIElement>(`li[data-value="${value}"]`)!
}

/** The single cell of a column that is reachable with `Tab` (roving tabindex) */
function getTabbable(columnIndex = 0) {
  return getColumn(columnIndex).querySelector<HTMLLIElement>('li[tabindex="0"]')
}

async function keyDown(cell: HTMLElement, key: string) {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
  cell.dispatchEvent(event)
  await flush()
  return event
}

async function focusOut(cell: HTMLElement, relatedTarget: EventTarget | null) {
  cell.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget }))
  await flush()
}

describe('timeColumn focus', () => {
  afterEach(() => {
    vi.useRealTimers()
    document.body.innerHTML = ''
  })

  describe('roving tabindex', () => {
    it('only the selected cell of each column is tabbable', async () => {
      renderTimePanel({ defaultValue: dayjs('1990-09-03 05:08:09') })
      await flush()

      ;[5, 8, 9].forEach((unit, columnIndex) => {
        expect(getColumn(columnIndex).querySelectorAll('li[tabindex="0"]')).toHaveLength(1)
        expect(getTabbable(columnIndex)).toBe(getCell(unit, columnIndex))
      })
    })

    it('falls back to the picker value when nothing is selected', async () => {
      vi.useFakeTimers({ toFake: ['Date'] })
      vi.setSystemTime(new Date('1990-09-03T00:00:00'))
      renderTimePanel()
      await flush()

      // `now` is 00:00:00, so the cursor sits on `0` even though no cell is selected
      expect(getTabbable()).toBe(getCell(0))
      expect(document.querySelector('.vc-picker-time-panel-cell-selected')).toBeFalsy()
    })
  })

  describe('onCellKeyDown', () => {
    it('arrowDown moves the cursor to the next cell', async () => {
      renderTimePanel({ defaultValue: dayjs('1990-09-03 05:00:00') })
      await flush()

      await keyDown(getCell(5), 'ArrowDown')

      expect(getTabbable()).toBe(getCell(6))
      expect(document.activeElement).toBe(getCell(6))
      expect(getCell(5).getAttribute('tabindex')).toBe('-1')
    })

    it('arrowUp moves the cursor to the previous cell', async () => {
      renderTimePanel({ defaultValue: dayjs('1990-09-03 05:00:00') })
      await flush()

      await keyDown(getCell(5), 'ArrowUp')

      expect(getTabbable()).toBe(getCell(4))
      expect(document.activeElement).toBe(getCell(4))
    })

    it('moving the cursor does not change the selected value', async () => {
      const onChange = vi.fn()
      renderTimePanel({ defaultValue: dayjs('1990-09-03 05:00:00'), onChange })
      await flush()

      await keyDown(getCell(5), 'ArrowDown')

      expect(onChange).not.toHaveBeenCalled()
      expect(getCell(5).classList).toContain('vc-picker-time-panel-cell-selected')
      expect(getCell(6).classList).not.toContain('vc-picker-time-panel-cell-selected')
    })

    it('arrowDown wraps from the last cell to the first', async () => {
      renderTimePanel({ defaultValue: dayjs('1990-09-03 23:00:00') })
      await flush()

      await keyDown(getCell(23), 'ArrowDown')

      expect(getTabbable()).toBe(getCell(0))
      expect(document.activeElement).toBe(getCell(0))
    })

    it('arrowUp wraps from the first cell to the last', async () => {
      renderTimePanel({ defaultValue: dayjs('1990-09-03 00:00:00') })
      await flush()

      await keyDown(getCell(0), 'ArrowUp')

      expect(getTabbable()).toBe(getCell(23))
      expect(document.activeElement).toBe(getCell(23))
    })

    it('skips disabled cells', async () => {
      renderTimePanel({
        defaultValue: dayjs('1990-09-03 05:00:00'),
        disabledTime: () => ({ disabledHours: () => [4, 6, 7] }),
      })
      await flush()

      expect(getCell(6).getAttribute('aria-disabled')).toBe('true')

      await keyDown(getCell(5), 'ArrowDown')
      expect(getTabbable()).toBe(getCell(8))
      expect(document.activeElement).toBe(getCell(8))

      await keyDown(getCell(8), 'ArrowUp')
      expect(getTabbable()).toBe(getCell(5))

      await keyDown(getCell(5), 'ArrowUp')
      expect(getTabbable()).toBe(getCell(3))
    })

    it.each([
      ['Enter', 'Enter'],
      ['Space', ' '],
    ])('%s selects the cell under the cursor', async (_, key) => {
      const onChange = vi.fn()
      renderTimePanel({ defaultValue: dayjs('1990-09-03 05:00:00'), onChange })
      await flush()

      await keyDown(getCell(5), 'ArrowDown')
      await keyDown(getCell(6), key)

      expect(onChange).toHaveBeenCalledTimes(1)
      expect(onChange.mock.calls[0]![0].format('HH:mm:ss')).toEqual('06:00:00')
      expect(getCell(6).classList).toContain('vc-picker-time-panel-cell-selected')
    })

    it('ignores keys it does not handle', async () => {
      const onChange = vi.fn()
      renderTimePanel({ defaultValue: dayjs('1990-09-03 05:00:00'), onChange })
      await flush()

      await keyDown(getCell(5), 'ArrowDown')
      await keyDown(getCell(6), 'a')

      expect(onChange).not.toHaveBeenCalled()
      expect(getTabbable()).toBe(getCell(6))
    })

    it.each(['ArrowDown', 'ArrowUp', 'Enter', ' '])('prevents the default behavior of `%s`', async (key) => {
      renderTimePanel({ defaultValue: dayjs('1990-09-03 05:00:00') })
      await flush()

      expect((await keyDown(getCell(5), key)).defaultPrevented).toBeTruthy()
    })

    it('does not prevent the default behavior of other keys', async () => {
      renderTimePanel({ defaultValue: dayjs('1990-09-03 05:00:00') })
      await flush()

      expect((await keyDown(getCell(5), 'Tab')).defaultPrevented).toBeFalsy()
    })
  })

  describe('focusout', () => {
    it('resets the cursor when focus leaves the column', async () => {
      renderTimePanel({ defaultValue: dayjs('1990-09-03 05:00:00') })
      await flush()

      await keyDown(getCell(5), 'ArrowDown')
      expect(getTabbable()).toBe(getCell(6))

      await focusOut(getCell(6), document.body)

      expect(getTabbable()).toBe(getCell(5))
    })

    it('resets the cursor when focus is lost entirely', async () => {
      renderTimePanel({ defaultValue: dayjs('1990-09-03 05:00:00') })
      await flush()

      await keyDown(getCell(5), 'ArrowDown')
      await focusOut(getCell(6), null)

      expect(getTabbable()).toBe(getCell(5))
    })

    it('resets the cursor when focus moves to another column', async () => {
      renderTimePanel({ defaultValue: dayjs('1990-09-03 05:08:09') })
      await flush()

      await keyDown(getCell(5), 'ArrowDown')
      await focusOut(getCell(6), getCell(8, 1))

      expect(getTabbable()).toBe(getCell(5))
      expect(getTabbable(1)).toBe(getCell(8, 1))
    })

    it('keeps the cursor when focus moves within the same column', async () => {
      renderTimePanel({ defaultValue: dayjs('1990-09-03 05:00:00') })
      await flush()

      await keyDown(getCell(5), 'ArrowDown')
      // This is what arrow navigation itself does: focus moves from cell to cell
      await focusOut(getCell(6), getCell(7))

      expect(getTabbable()).toBe(getCell(6))
    })
  })

  describe('cursor reset', () => {
    it('follows the value when a cell is clicked', async () => {
      renderTimePanel({ defaultValue: dayjs('1990-09-03 05:00:00') })
      await flush()

      await keyDown(getCell(5), 'ArrowDown')
      expect(getTabbable()).toBe(getCell(6))

      getCell(10).click()
      await flush()

      expect(getTabbable()).toBe(getCell(10))
      expect(getCell(10).classList).toContain('vc-picker-time-panel-cell-selected')
    })

    it('does not steal focus when the value changes', async () => {
      renderTimePanel({ defaultValue: dayjs('1990-09-03 05:00:00') })
      await flush()

      getCell(10).click()
      await flush()

      expect(document.activeElement).not.toBe(getCell(10))
      expect(document.activeElement).toBe(document.body)
    })
  })

  describe('semantics', () => {
    it('labels columns and options', async () => {
      renderTimePanel({ defaultValue: dayjs('1990-09-03 05:08:09') })
      await flush()

      const column = getColumn(0)
      expect(column.getAttribute('role')).toBe('listbox')
      expect(column.getAttribute('aria-label')).toBe('Select an hour')
      expect(getColumn(1).getAttribute('aria-label')).toBe('Select a minute')
      expect(getColumn(2).getAttribute('aria-label')).toBe('Select a second')

      expect(getCell(5).getAttribute('role')).toBe('option')
      expect(getCell(5).getAttribute('aria-selected')).toBe('true')
      expect(getCell(6).getAttribute('aria-selected')).toBe('false')
      expect(getCell(5).getAttribute('aria-label')).toBe('5 hours')
    })

    it('uses the locale for labels', async () => {
      renderTimePanel({ locale: zhCN, defaultValue: dayjs('1990-09-03 05:08:09') })
      await flush()

      expect(getColumn(0).getAttribute('aria-label')).toBe('选择时')
      expect(getColumn(1).getAttribute('aria-label')).toBe('选择分')
    })
  })
})
