import dayjs from 'dayjs'
import { describe, expect, it } from 'vitest'
import { nextTick, ref } from 'vue'
import generateConfig from '../src/generate/dayjs'
import locale from '../src/locale/en_US'
import { useInnerValue } from '../src/PickerInput/hooks/useRangeValue'

describe('useInnerValue uncontrolled', () => {
  it('updates merged/calendar value when internal value changes', async () => {
    const value = ref(undefined) as any

    const [mergedValue, setInnerValue, calendarValue] = useInnerValue(
      ref(generateConfig as any),
      ref(locale as any),
      ref(['YYYY-MM-DD HH:mm:ss'] as any),
      ref(false),
      ref(true),
      ref(undefined),
      value,
    )

    expect(mergedValue.value).toEqual([])
    expect(calendarValue.value).toEqual([])

    setInnerValue([dayjs('2026-02-23 10:00:00')] as any)
    await nextTick()

    expect(mergedValue.value).toHaveLength(1)
    expect(calendarValue.value).toHaveLength(1)
  })
})
