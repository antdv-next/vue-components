import { mount } from '@vue/test-utils'
import dayjs from 'dayjs'
import { describe, expect, it, vi } from 'vitest'
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
      ...props,
    },
  })
}

function inputs(wrapper: ReturnType<typeof mountRange>) {
  return wrapper.findAll('input')
}

/**
 * Integration coverage for the centralized interaction flow. The state machine
 * itself is unit-tested in `useRangeValueChange.test.ts`; these cases check the
 * RangePicker wiring around it.
 */
describe('rangePicker interaction flow', () => {
  it('opens on field focus and reports the focused range', async () => {
    const onFocus = vi.fn()
    const wrapper = mountRange({ onFocus })
    await flush()

    await inputs(wrapper)[0].trigger('focus')
    await flush()

    expect(onFocus).toHaveBeenCalled()
    expect(onFocus.mock.calls[0][1]).toEqual({ range: 'start' })

    wrapper.unmount()
  })

  it('reports the end range when the second field is focused', async () => {
    const onFocus = vi.fn()
    const wrapper = mountRange({ onFocus })
    await flush()

    await inputs(wrapper)[1].trigger('focus')
    await flush()

    expect(onFocus.mock.calls.at(-1)?.[1]).toEqual({ range: 'end' })

    wrapper.unmount()
  })

  it('does not emit onChange until both fields are filled', async () => {
    const onChange = vi.fn()
    const wrapper = mountRange({ onChange })
    await flush()

    const [startInput] = inputs(wrapper)
    await startInput.trigger('focus')
    await startInput.setValue('2026-02-01')
    await startInput.trigger('keydown', { key: 'Enter' })
    await flush()

    // Only the start field is committed so far — a range change would be
    // reporting a half-finished value.
    expect(onChange).not.toHaveBeenCalled()

    wrapper.unmount()
  })

  it('emits onChange once both fields are submitted', async () => {
    const onChange = vi.fn()
    const wrapper = mountRange({ onChange })
    await flush()

    const [startInput, endInput] = inputs(wrapper)

    await startInput.trigger('focus')
    await startInput.setValue('2026-02-01')
    await startInput.trigger('keydown', { key: 'Enter' })
    await flush()

    await endInput.trigger('focus')
    await endInput.setValue('2026-02-05')
    await endInput.trigger('keydown', { key: 'Enter' })
    await flush()

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange.mock.calls[0][1]).toEqual(['2026-02-01', '2026-02-05'])

    wrapper.unmount()
  })

  it('restores the committed value when Escape aborts the interaction', async () => {
    const onChange = vi.fn()
    const wrapper = mountRange({
      value: [dayjs('2026-02-01'), dayjs('2026-02-05')],
      onChange,
    })
    await flush()

    const [startInput] = inputs(wrapper)
    await startInput.trigger('focus')
    await startInput.setValue('2026-03-09')
    await flush()

    await startInput.trigger('keydown', { key: 'Escape' })
    await flush()

    expect(onChange).not.toHaveBeenCalled()
    expect((startInput.element as HTMLInputElement).value).toBe('2026-02-01')

    wrapper.unmount()
  })

  it('clears both fields through the clear button', async () => {
    const onChange = vi.fn()
    const wrapper = mountRange({
      value: [dayjs('2026-02-01'), dayjs('2026-02-05')],
      allowClear: { clearIcon: 'x' },
      onChange,
    })
    await flush()

    const clearBtn = wrapper.find('.vc-picker-clear')
    expect(clearBtn.exists()).toBe(true)

    await clearBtn.trigger('mousedown')
    await clearBtn.trigger('click')
    await flush()

    expect(onChange).toHaveBeenCalled()
    expect(onChange.mock.calls.at(-1)?.[0]).toBe(null)

    wrapper.unmount()
  })
})
