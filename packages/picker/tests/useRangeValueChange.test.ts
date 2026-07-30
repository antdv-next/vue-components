import { describe, expect, it, vi } from 'vitest'
import { computed, ref } from 'vue'
import useRangeValueChange from '../src/PickerInput/hooks/useRangeValueChange'

/**
 * Drive the interaction state machine with a fake two-field CalendarValue so
 * the resolved actions can be asserted without mounting a Picker.
 */
function setup(options: {
  fieldCount?: number
  needConfirm?: boolean
  allowEmpty?: boolean[]
  initial?: (string | null)[]
} = {}) {
  const {
    fieldCount = 2,
    needConfirm = false,
    allowEmpty = [false, false],
    initial = [null, null],
  } = options

  const calendar = ref<(string | null)[]>([...initial])
  const committed = ref<(string | null)[]>([...initial])

  const onFinalChange = vi.fn()

  const flushSubmit = vi.fn((index: number, needTriggerChange: boolean) => {
    committed.value = [...committed.value]
    committed.value[index] = calendar.value[index]
    if (needTriggerChange) {
      onFinalChange(committed.value)
    }
  })

  const triggerCalendarChange = vi.fn((index: number, value: string) => {
    const next = [...calendar.value]
    next[index] = value
    calendar.value = next
  })

  const resetValue = vi.fn((index?: number) => {
    if (index === undefined) {
      calendar.value = [...committed.value]
      return
    }
    const next = [...calendar.value]
    next[index] = committed.value[index]
    calendar.value = next
  })

  const [currentIndex, activeIndex, forceFocus, triggeredFields, triggerChange, reset]
    = useRangeValueChange<string>(
      computed(() => fieldCount),
      computed(() => needConfirm),
      computed(() => allowEmpty),
      () => calendar.value,
      triggerCalendarChange,
      flushSubmit,
      resetValue,
    )

  return {
    calendar,
    committed,
    flushSubmit,
    onFinalChange,
    resetValue,
    currentIndex,
    activeIndex,
    forceFocus,
    triggeredFields,
    triggerChange,
    reset,
  }
}

describe('useRangeValueChange', () => {
  it('starts an interaction on the first non-close event', () => {
    const ctx = setup()
    expect(ctx.currentIndex.value).toBe(null)

    ctx.triggerChange(0, 'input', 'a')

    expect(ctx.currentIndex.value).toBe(0)
    expect(ctx.triggeredFields.value).toEqual([0])
    expect(ctx.calendar.value).toEqual(['a', null])
    // `input` only modifies — it must not submit.
    expect(ctx.flushSubmit).not.toHaveBeenCalled()
  })

  it('advances and submits both fields, then emits the final change', () => {
    const ctx = setup()

    ctx.triggerChange(0, 'panel-final', 'a')
    expect(ctx.currentIndex.value).toBe(1)
    expect(ctx.forceFocus.value).toBe(true)
    expect(ctx.onFinalChange).not.toHaveBeenCalled()

    ctx.triggerChange(1, 'panel-final', 'b')

    expect(ctx.onFinalChange).toHaveBeenCalledTimes(1)
    expect(ctx.committed.value).toEqual(['a', 'b'])
    // Round complete -> interaction reset.
    expect(ctx.currentIndex.value).toBe(null)
    expect(ctx.triggeredFields.value).toEqual([])
  })

  it('keeps `activeIndex` on the last valid field after the round ends', () => {
    const ctx = setup()

    ctx.triggerChange(0, 'panel-final', 'a')
    expect(ctx.activeIndex.value).toBe(1)

    ctx.triggerChange(1, 'panel-final', 'b')
    // `currentIndex` is cleared but the panel still needs a field to render.
    expect(ctx.currentIndex.value).toBe(null)
    expect(ctx.activeIndex.value).toBe(1)
  })

  it('discards every temporary value on Escape', () => {
    const ctx = setup({ initial: ['x', 'y'] })

    ctx.triggerChange(0, 'input', 'a')
    expect(ctx.calendar.value).toEqual(['a', 'y'])

    ctx.triggerChange(0, 'esc')

    expect(ctx.resetValue).toHaveBeenCalledWith()
    expect(ctx.calendar.value).toEqual(['x', 'y'])
    expect(ctx.currentIndex.value).toBe(null)
  })

  it('finishes an untouched interaction without resetting values', () => {
    const ctx = setup({ initial: ['x', 'y'] })

    // Focus only — nothing modified.
    ctx.triggerChange(0, 'field-switch')
    ctx.triggerChange(0, 'popupClose')

    expect(ctx.resetValue).not.toHaveBeenCalled()
    expect(ctx.calendar.value).toEqual(['x', 'y'])
    expect(ctx.currentIndex.value).toBe(null)
  })

  it('part-submits without advancing on a weak keyboard submit', () => {
    const ctx = setup()

    ctx.triggerChange(0, 'input', 'a')
    ctx.triggerChange(0, 'keyboard-submit-weak')

    expect(ctx.flushSubmit).toHaveBeenCalledWith(0, false)
    // Stays on the same field.
    expect(ctx.currentIndex.value).toBe(0)
    expect(ctx.onFinalChange).not.toHaveBeenCalled()
  })

  it('ignores a field switch that is not the next field in order', () => {
    const ctx = setup({ fieldCount: 3 })

    ctx.triggerChange(0, 'input', 'a')
    ctx.triggerChange(2, 'field-switch')

    expect(ctx.currentIndex.value).toBe(0)
  })

  describe('needConfirm', () => {
    it('does not submit an unconfirmed range when the popup closes', () => {
      // Regression guard for ant-design#58803: closing the popup with only one
      // field confirmed must discard the temporary value rather than commit a
      // half-finished range.
      const ctx = setup({ needConfirm: true, initial: ['x', 'y'] })

      ctx.triggerChange(0, 'input', 'a')
      ctx.triggerChange(0, 'popupClose')

      expect(ctx.onFinalChange).not.toHaveBeenCalled()
      expect(ctx.committed.value).toEqual(['x', 'y'])
      expect(ctx.calendar.value).toEqual(['x', 'y'])
    })

    it('locks an unconfirmed non-empty field against switching away', () => {
      const ctx = setup({ needConfirm: true })

      ctx.triggerChange(0, 'input', 'a')
      ctx.triggerChange(1, 'field-switch')

      // Still on field 0 — the value was never confirmed.
      expect(ctx.currentIndex.value).toBe(0)
    })

    it('allows switching after an explicit confirm', () => {
      const ctx = setup({ needConfirm: true })

      ctx.triggerChange(0, 'input', 'a')
      ctx.triggerChange(0, 'keyboard-submit-weak')
      ctx.triggerChange(1, 'field-switch')

      expect(ctx.currentIndex.value).toBe(1)
    })

    it('resets an unconfirmed allow-empty field instead of locking', () => {
      const ctx = setup({ needConfirm: true, allowEmpty: [true, true], initial: ['x', 'y'] })

      ctx.triggerChange(0, 'input', 'a')
      ctx.triggerChange(1, 'field-switch')

      expect(ctx.currentIndex.value).toBe(1)
      // The unconfirmed edit is discarded on the way out.
      expect(ctx.calendar.value).toEqual(['x', 'y'])
    })
  })

  it('submits a valid field on popup close when confirmation is not required', () => {
    const ctx = setup()

    ctx.triggerChange(0, 'input', 'a')
    ctx.triggerChange(0, 'popupClose')

    expect(ctx.flushSubmit).toHaveBeenCalled()
    expect(ctx.committed.value[0]).toBe('a')
  })

  it('discards an empty field on popup close when empty is not allowed', () => {
    const ctx = setup({ initial: ['x', 'y'] })

    ctx.triggerChange(0, 'input', null as any)
    ctx.triggerChange(0, 'popupClose')

    expect(ctx.onFinalChange).not.toHaveBeenCalled()
    expect(ctx.calendar.value).toEqual(['x', 'y'])
  })

  it('reset() clears bookkeeping without touching values', () => {
    const ctx = setup({ initial: ['x', 'y'] })

    ctx.triggerChange(0, 'input', 'a')
    ctx.reset()

    expect(ctx.currentIndex.value).toBe(null)
    expect(ctx.triggeredFields.value).toEqual([])
    expect(ctx.resetValue).not.toHaveBeenCalled()
    expect(ctx.calendar.value).toEqual(['a', 'y'])
  })
})
