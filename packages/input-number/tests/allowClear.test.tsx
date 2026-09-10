import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'
import InputNumber from '../src'

const CLEAR_CLS = '.vc-input-number-clear-icon'

async function typeValue(wrapper: ReturnType<typeof mount>, value: string) {
  const input = wrapper.find('input')
  input.element.value = value
  await input.trigger('input')
  await nextTick()
}

describe('input-number allowClear', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('does not render the clear action without allowClear', () => {
    const wrapper = mount(InputNumber, { props: { defaultValue: 1 } })
    expect(wrapper.find(CLEAR_CLS).exists()).toBe(false)
    expect(wrapper.find('.vc-input-number-suffix').exists()).toBe(false)
  })

  it('treats a null allowClear value as disabled', () => {
    const wrapper = mount(InputNumber, { props: { allowClear: null as any, defaultValue: 1 } })
    expect(wrapper.find(CLEAR_CLS).exists()).toBe(false)
  })

  it('clears an uncontrolled value and calls change callbacks', async () => {
    const calls: string[] = []
    const onChange = vi.fn(() => calls.push('change'))
    const onClear = vi.fn(() => calls.push('clear'))
    const wrapper = mount(InputNumber, {
      props: { allowClear: true, defaultValue: 123, onChange, onClear },
    })

    await wrapper.find(CLEAR_CLS).trigger('click')

    expect(wrapper.find('input').element.value).toBe('')
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith(null)
    expect(onClear).toHaveBeenCalledTimes(1)
    expect(calls).toEqual(['change', 'clear'])
    expect(wrapper.emitted('update:value')?.[0]).toEqual([null])
  })

  it('clears raw input when the decimal value is already empty', async () => {
    const onChange = vi.fn()
    const onClear = vi.fn()
    const wrapper = mount(InputNumber, { props: { allowClear: true, onChange, onClear } })
    const clearButton = wrapper.find<HTMLButtonElement>(CLEAR_CLS)

    expect(clearButton.classes()).toContain('vc-input-number-clear-icon-hidden')
    expect(clearButton.element.disabled).toBe(true)

    await typeValue(wrapper, '-')

    expect(clearButton.classes()).not.toContain('vc-input-number-clear-icon-hidden')
    expect(clearButton.element.disabled).toBe(false)

    await clearButton.trigger('click')

    expect(wrapper.find('input').element.value).toBe('')
    expect(onChange).not.toHaveBeenCalled()
    expect(onClear).toHaveBeenCalledTimes(1)
  })

  it('keeps raw input clearable when focus moves to the clear button', async () => {
    const onClear = vi.fn()
    const onBlur = vi.fn()
    const wrapper = mount(InputNumber, {
      props: { allowClear: true, onClear, onBlur },
      attachTo: document.body,
    })
    const input = wrapper.find('input')
    const clearButton = wrapper.find<HTMLButtonElement>(CLEAR_CLS)

    input.element.focus()
    await input.trigger('focus')
    await typeValue(wrapper, '-')

    // Focus moves to the clear button: blur with relatedTarget inside root is ignored.
    await input.trigger('blur', { relatedTarget: clearButton.element })
    clearButton.element.focus()
    await nextTick()

    expect(document.activeElement).toBe(clearButton.element)
    expect(onBlur).not.toHaveBeenCalled()
    expect(clearButton.element.disabled).toBe(false)
    expect(input.element.value).toBe('-')

    await clearButton.trigger('click')

    expect(input.element.value).toBe('')
    expect(document.activeElement).toBe(input.element)
    expect(onClear).toHaveBeenCalledTimes(1)

    wrapper.unmount()
  })

  it('does not restore pending input normalization after clearing', async () => {
    vi.useFakeTimers()
    try {
      const onChange = vi.fn()
      const wrapper = mount(InputNumber, { props: { allowClear: true, onChange } })
      const input = wrapper.find('input')

      await typeValue(wrapper, '8。1')
      onChange.mockClear()

      await wrapper.find(CLEAR_CLS).trigger('click')

      expect(input.element.value).toBe('')
      expect(onChange).toHaveBeenCalledTimes(1)
      expect(onChange).toHaveBeenCalledWith(null)

      vi.runOnlyPendingTimers()
      await nextTick()

      expect(input.element.value).toBe('')
      expect(onChange).toHaveBeenCalledTimes(1)
    }
    finally {
      vi.clearAllTimers()
      vi.useRealTimers()
    }
  })

  it('uses the null contract without parsing empty text', async () => {
    const parser = vi.fn((text?: string) => (text === '' ? 0 : Number(text)))
    const formatter = vi.fn((nextValue: any, { input }: { input: string }) => input || String(nextValue ?? ''))
    const onChange = vi.fn()
    const wrapper = mount(InputNumber, {
      props: { allowClear: true, defaultValue: 1, parser, formatter, onChange },
    })

    parser.mockClear()
    formatter.mockClear()
    await wrapper.find(CLEAR_CLS).trigger('click')

    expect(wrapper.find('input').element.value).toBe('')
    expect(onChange).toHaveBeenCalledWith(null)
    expect(parser).not.toHaveBeenCalled()
    expect(formatter.mock.calls.at(-1)?.[1]).toEqual({ userTyping: false, input: '' })
  })

  it('notifies without overriding a controlled value', async () => {
    const onChange = vi.fn()
    const onClear = vi.fn()
    const wrapper = mount(InputNumber, {
      props: { allowClear: true, value: 123, onChange, onClear },
    })

    await wrapper.find(CLEAR_CLS).trigger('click')

    expect(wrapper.find('input').element.value).toBe('123')
    expect(onChange).toHaveBeenCalledWith(null)
    expect(onClear).toHaveBeenCalledTimes(1)
  })

  it('clears when controlled state accepts null', async () => {
    const Demo = defineComponent(() => {
      const value = ref<number | null>(123)
      return () => <InputNumber allowClear v-model:value={value.value} />
    })
    const wrapper = mount(Demo)

    await wrapper.find(CLEAR_CLS).trigger('click')

    expect(wrapper.find('input').element.value).toBe('')
  })

  it('supports clearing zero', async () => {
    const onChange = vi.fn()
    const wrapper = mount(InputNumber, { props: { allowClear: true, defaultValue: 0, onChange } })
    const clearButton = wrapper.find(CLEAR_CLS)

    expect(clearButton.classes()).not.toContain('vc-input-number-clear-icon-hidden')
    await clearButton.trigger('click')

    expect(wrapper.find('input').element.value).toBe('')
    expect(onChange).toHaveBeenCalledWith(null)
  })

  it('clears to null when precision is configured', async () => {
    const onChange = vi.fn()
    const wrapper = mount(InputNumber, {
      props: { allowClear: true, defaultValue: 1.23, precision: 2, onChange },
    })

    await wrapper.find(CLEAR_CLS).trigger('click')

    expect(wrapper.find('input').element.value).toBe('')
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith(null)
  })

  it('supports a custom clear icon via prop and slot', () => {
    const propWrapper = mount(InputNumber, {
      props: { allowClear: { clearIcon: '⌫' }, defaultValue: 1 },
    })
    expect(propWrapper.find(CLEAR_CLS).text()).toBe('⌫')

    const slotWrapper = mount(InputNumber, {
      props: { allowClear: true, defaultValue: 1 },
      slots: { clearIcon: () => <span data-testid="custom-clear">clear</span> },
    })
    expect(slotWrapper.find('[data-testid="custom-clear"]').exists()).toBe(true)
  })

  it('supports a localized accessible label', () => {
    const wrapper = mount(InputNumber, {
      props: { allowClear: { label: 'Effacer' }, defaultValue: 1 },
    })
    expect(wrapper.find(CLEAR_CLS).attributes('aria-label')).toBe('Effacer')

    const defaultWrapper = mount(InputNumber, { props: { allowClear: true, defaultValue: 1 } })
    expect(defaultWrapper.find(CLEAR_CLS).attributes('aria-label')).toBe('Clear')
    expect(defaultWrapper.find(CLEAR_CLS).attributes('type')).toBe('button')
  })

  it('renders the clear action without hiding the suffix', async () => {
    const wrapper = mount(InputNumber, { props: { allowClear: true, defaultValue: 1, suffix: 'suffix' } })
    const suffixNode = wrapper.find('.vc-input-number-suffix')
    const clearButton = wrapper.find(CLEAR_CLS)

    expect(suffixNode.element.contains(clearButton.element)).toBe(true)
    expect(suffixNode.text()).toContain('suffix')
    expect(clearButton.classes()).not.toContain('vc-input-number-clear-icon-hidden')
    expect(clearButton.classes()).toContain('vc-input-number-clear-icon-has-suffix')

    await clearButton.trigger('click')

    expect(clearButton.classes()).toContain('vc-input-number-clear-icon-hidden')
    expect(wrapper.find('.vc-input-number-suffix').exists()).toBe(true)
  })

  it.each([
    ['disabled', { disabled: true }],
    ['readOnly', { readOnly: true }],
    ['allowClear.disabled', { allowClear: { disabled: true } }],
  ])('disables the clear action when %s', async (_name, extraProps) => {
    const onChange = vi.fn()
    const onClear = vi.fn()
    const wrapper = mount(InputNumber, {
      props: {
        allowClear: true,
        defaultValue: 1,
        styles: { clear: { visibility: 'visible' } },
        onChange,
        onClear,
        ...extraProps,
      } as any,
    })
    const clearButton = wrapper.find<HTMLButtonElement>(CLEAR_CLS)

    expect(clearButton.classes()).toContain('vc-input-number-clear-icon-hidden')
    expect(clearButton.element.disabled).toBe(true)

    await clearButton.trigger('click')

    expect(wrapper.find('input').element.value).toBe('1')
    expect(onChange).not.toHaveBeenCalled()
    expect(onClear).not.toHaveBeenCalled()
  })

  it('applies semantic classNames and styles', () => {
    const wrapper = mount(InputNumber, {
      props: {
        allowClear: true,
        defaultValue: 1,
        classNames: { clear: 'test-clear' },
        styles: { clear: { color: 'rgb(128, 0, 128)' } },
      },
    })
    const clearButton = wrapper.find<HTMLButtonElement>(CLEAR_CLS)
    expect(clearButton.classes()).toContain('test-clear')
    expect(clearButton.element.style.color).toBe('rgb(128, 0, 128)')
  })

  it('preserves input focus on pointer interaction', async () => {
    const onBlur = vi.fn()
    const wrapper = mount(InputNumber, {
      props: { allowClear: true, defaultValue: 1, onBlur },
      attachTo: document.body,
    })
    const input = wrapper.find('input')
    const clearButton = wrapper.find(CLEAR_CLS)

    input.element.focus()
    const mousedown = new MouseEvent('mousedown', { bubbles: true, cancelable: true })
    clearButton.element.dispatchEvent(mousedown)
    expect(mousedown.defaultPrevented).toBe(true)
    await clearButton.trigger('click')

    expect(document.activeElement).toBe(input.element)
    expect(onBlur).not.toHaveBeenCalled()

    wrapper.unmount()
  })

  it('isolates conflicting keys but lets unrelated keys propagate', async () => {
    const onChange = vi.fn()
    const onPressEnter = vi.fn()
    const onStep = vi.fn()
    const onParentKeyDown = vi.fn()
    const Demo = defineComponent(() => () => (
      <div onKeydown={onParentKeyDown}>
        <InputNumber allowClear value={1} onChange={onChange} onPressEnter={onPressEnter} onStep={onStep} />
      </div>
    ))
    const wrapper = mount(Demo)
    const input = wrapper.find('input')
    const clearButton = wrapper.find(CLEAR_CLS)

    await typeValue(wrapper, '2')
    onChange.mockClear()

    for (const key of ['Enter', 'Up', 'ArrowUp', 'Down', 'ArrowDown']) {
      await clearButton.trigger('keydown', { key })
    }

    expect(onPressEnter).not.toHaveBeenCalled()
    expect(onStep).not.toHaveBeenCalled()
    expect(onChange).not.toHaveBeenCalled()
    expect(input.element.value).toBe('2')
    expect(onParentKeyDown).not.toHaveBeenCalled()

    await clearButton.trigger('keydown', { key: 'Escape' })
    await clearButton.trigger('keydown', { key: ' ' })

    expect(onParentKeyDown.mock.calls.map(([event]) => event.key)).toEqual(['Escape', ' '])

    await clearButton.trigger('click')
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith(null)
    expect(input.element.value).toBe('1')
  })

  it('lets step keys propagate when keyboard stepping is disabled', async () => {
    const onParentKeyDown = vi.fn()
    const onStep = vi.fn()
    const Demo = defineComponent(() => () => (
      <div onKeydown={onParentKeyDown}>
        <InputNumber allowClear defaultValue={1} keyboard={false} onStep={onStep} />
      </div>
    ))
    const wrapper = mount(Demo)
    const clearButton = wrapper.find(CLEAR_CLS)

    for (const key of ['Up', 'ArrowUp', 'Down', 'ArrowDown']) {
      await clearButton.trigger('keydown', { key })
    }

    expect(onStep).not.toHaveBeenCalled()
    expect(onParentKeyDown.mock.calls.map(([event]) => event.key)).toEqual(['Up', 'ArrowUp', 'Down', 'ArrowDown'])
  })
})

describe('input-number renderable guards', () => {
  it('renders 0 prefix/suffix but skips empty string', () => {
    const wrapper = mount(InputNumber, { props: { prefix: 0, suffix: 0 } })
    expect(wrapper.find('.vc-input-number-prefix').text()).toBe('0')
    expect(wrapper.find('.vc-input-number-suffix').text()).toBe('0')

    const emptyWrapper = mount(InputNumber, { props: { prefix: '', suffix: '' } })
    expect(emptyWrapper.find('.vc-input-number-prefix').exists()).toBe(false)
    expect(emptyWrapper.find('.vc-input-number-suffix').exists()).toBe(false)
  })
})
