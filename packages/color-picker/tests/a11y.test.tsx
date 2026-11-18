import type { Color } from '../src'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'
import ColorPicker, { ColorBlock, Picker } from '../src'
import { generateColor } from '../src/util'

const defaultColor = '#1677ff'

const Controlled = defineComponent({
  inheritAttrs: false,
  setup(_, { attrs }) {
    const value = ref<Color>(generateColor(defaultColor))
    return () => (
      <>
        <ColorPicker
          {...attrs}
          value={value.value}
          onChange={(c: Color) => {
            value.value = c
          }}
        />
        <div class="pick-color">{value.value.toHsbString()}</div>
      </>
    )
  },
})

function setup(node: () => any) {
  const wrapper = mount(node, { attachTo: document.body })
  const byLabel = (label: string) =>
    Array.from(document.querySelectorAll<HTMLInputElement>(`input[aria-label="${label}"]`))
  return { wrapper, byLabel }
}

async function key(el: HTMLElement, type: 'keydown' | 'keyup', k: string) {
  el.dispatchEvent(new KeyboardEvent(type, { key: k, bubbles: true, cancelable: true }))
  await nextTick()
}

async function setRangeValue(el: HTMLInputElement, value: string) {
  el.value = value
  el.dispatchEvent(new Event('input', { bubbles: true }))
  await nextTick()
}

async function focusOut(el: HTMLElement) {
  el.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: document.body }))
  await nextTick()
}

const pickColor = () => document.querySelector('.pick-color')!.innerHTML

describe('color-picker accessibility', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('exposes default aria-labels and value text on the handles', () => {
    const { byLabel } = setup(() => <ColorPicker defaultValue={defaultColor} />)
    const [saturation, brightness] = byLabel('Color picker')
    expect(byLabel('Color picker')).toHaveLength(2)
    expect(byLabel('Hue')).toHaveLength(1)
    expect(byLabel('Alpha')).toHaveLength(1)

    expect(saturation!.type).toBe('range')
    expect(saturation!.getAttribute('aria-valuetext')).toBe('Saturation: 91%')
    expect(saturation!.getAttribute('aria-roledescription')).toBe('2D slider')
    expect(saturation!.getAttribute('aria-orientation')).toBe('horizontal')
    expect(brightness!.getAttribute('aria-valuetext')).toBe('Brightness: 100%')
    expect(brightness!.getAttribute('aria-orientation')).toBe('vertical')
    expect(byLabel('Hue')[0]!.max).toBe('359')
    expect(byLabel('Alpha')[0]!.max).toBe('100')
  })

  it('overrides labels through locale and falls back for undefined keys', () => {
    const { byLabel } = setup(() => (
      <ColorPicker
        defaultValue={defaultColor}
        locale={{ picker: 'Sélecteur', hue: 'Teinte', alpha: undefined, saturation: 'Sat', brightness: 'Lum' }}
      />
    ))
    const [saturation, brightness] = byLabel('Sélecteur')
    expect(byLabel('Sélecteur')).toHaveLength(2)
    expect(byLabel('Teinte')).toHaveLength(1)
    expect(byLabel('Alpha')).toHaveLength(1)
    expect(saturation!.getAttribute('aria-valuetext')).toBe('Sat: 91%')
    expect(brightness!.getAttribute('aria-valuetext')).toBe('Lum: 100%')
  })

  it('falls back to default labels when Picker is used standalone', () => {
    const { byLabel } = setup(() => (
      <Picker color={generateColor(defaultColor)} prefixCls="vc-color-picker" />
    ))
    const [saturation, brightness] = byLabel('Color picker')
    expect(byLabel('Color picker')).toHaveLength(2)
    expect(saturation!.getAttribute('aria-roledescription')).toBe('2D slider')
    expect(saturation!.getAttribute('aria-valuetext')).toBe('Saturation: 91%')
    expect(brightness!.getAttribute('aria-valuetext')).toBe('Brightness: 100%')
  })

  it('keeps the 2-D picker a single tab stop and exposes only the active axis', async () => {
    const { byLabel } = setup(() => <ColorPicker defaultValue={defaultColor} />)
    const [saturation, brightness] = byLabel('Color picker')

    expect(saturation!.getAttribute('tabindex')).toBe('0')
    expect(saturation!.getAttribute('aria-hidden')).not.toBe('true')
    expect(brightness!.getAttribute('tabindex')).toBe('-1')
    expect(brightness!.getAttribute('aria-hidden')).toBe('true')

    // Value keys temporarily expose both axes.
    await key(saturation!, 'keydown', 'ArrowRight')
    expect(brightness!.getAttribute('aria-hidden')).not.toBe('true')
    await key(saturation!, 'keyup', 'ArrowRight')
    expect(brightness!.getAttribute('aria-hidden')).toBe('true')

    // Switching direction moves the tab stop and focus onto the adjusted axis.
    await key(saturation!, 'keydown', 'ArrowDown')
    expect(brightness!.getAttribute('tabindex')).toBe('0')
    expect(saturation!.getAttribute('tabindex')).toBe('-1')
    expect(document.activeElement).toBe(brightness)

    await focusOut(brightness!)
    expect(saturation!.getAttribute('aria-hidden')).toBe('true')
    expect(brightness!.getAttribute('aria-hidden')).not.toBe('true')
  })

  it('does not hide or untab a 1-D slider', async () => {
    const { byLabel } = setup(() => <ColorPicker defaultValue={defaultColor} />)
    const hue = byLabel('Hue')[0]!
    expect(hue.getAttribute('tabindex')).toBe('0')
    await key(hue, 'keydown', 'ArrowRight')
    expect(hue.getAttribute('tabindex')).toBe('0')
    expect(hue.getAttribute('aria-hidden')).not.toBe('true')
  })

  it('adjusts saturation and brightness with arrow keys', async () => {
    const onChangeComplete = vi.fn()
    const { byLabel } = setup(() => <Controlled onChangeComplete={onChangeComplete} />)
    const [saturation, brightness] = byLabel('Color picker')

    await key(saturation!, 'keydown', 'ArrowRight')
    await key(saturation!, 'keyup', 'ArrowRight')
    expect(pickColor()).toBe('hsb(215, 92%, 100%)')
    expect(onChangeComplete).toHaveBeenCalledTimes(1)

    await key(saturation!, 'keydown', 'ArrowLeft')
    await key(saturation!, 'keydown', 'ArrowLeft')
    await key(saturation!, 'keyup', 'ArrowLeft')
    expect(pickColor()).toBe('hsb(215, 90%, 100%)')

    await key(brightness!, 'keydown', 'ArrowDown')
    await key(brightness!, 'keyup', 'ArrowDown')
    expect(pickColor()).toBe('hsb(215, 90%, 99%)')
    expect(onChangeComplete).toHaveBeenCalledTimes(3)
  })

  it('moves the picker handle when the value changes from the keyboard', async () => {
    const { wrapper, byLabel } = setup(() => <Controlled />)
    const transform = () => (wrapper.find('.vc-color-picker-select .vc-color-picker-handler').element.parentElement as HTMLElement).style.top
    const before = transform()
    const brightness = byLabel('Color picker')[1]!
    for (let i = 0; i < 10; i += 1) {
      await key(brightness, 'keydown', 'ArrowDown')
    }
    await key(brightness, 'keyup', 'ArrowDown')
    expect(transform()).not.toBe(before)
  })

  it('moves the picker handle when the controlled value changes', async () => {
    const value = ref('#1677ff')
    const { wrapper } = setup(() => <ColorPicker value={value.value} />)
    const top = () => (wrapper.find('.vc-color-picker-select .vc-color-picker-handler').element.parentElement as HTMLElement).style.top
    expect(top()).toBe('0%')
    value.value = '#000000'
    await nextTick()
    expect(top()).toBe('100%')
  })

  it('keeps both axes across rapid presses before the parent re-renders', async () => {
    const onChange = vi.fn()
    const { byLabel } = setup(() => <ColorPicker value={defaultColor} onChange={onChange} />)
    const [saturation] = byLabel('Color picker')

    // A rejecting parent: within one press values advance, a new press restarts.
    saturation!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
    saturation!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))
    await nextTick()
    const last = onChange.mock.calls.at(-1)![0] as Color
    expect(Math.round(last.toHsb().s * 100)).toBe(92)
    expect(Math.round(last.toHsb().b * 100)).toBe(99)

    await key(saturation!, 'keyup', 'ArrowDown')
    onChange.mockClear()
    await key(saturation!, 'keydown', 'ArrowRight')
    expect(Math.round((onChange.mock.calls[0]![0] as Color).toHsb().s * 100)).toBe(92)
  })

  it('does not emit when an arrow key clamps at a bound', async () => {
    const onChange = vi.fn()
    const onChangeComplete = vi.fn()
    const { byLabel } = setup(() => (
      <ColorPicker value={defaultColor} onChange={onChange} onChangeComplete={onChangeComplete} />
    ))
    const brightness = byLabel('Color picker')[1]!
    await key(brightness, 'keydown', 'ArrowUp')
    await key(brightness, 'keyup', 'ArrowUp')
    expect(onChange).not.toHaveBeenCalled()
    expect(onChangeComplete).not.toHaveBeenCalled()
  })

  it('completes an assistive-technology value change immediately', async () => {
    const onChange = vi.fn()
    const onChangeComplete = vi.fn()
    const { byLabel } = setup(() => (
      <ColorPicker defaultValue={defaultColor} onChange={onChange} onChangeComplete={onChangeComplete} />
    ))
    const alpha = byLabel('Alpha')[0]!
    await setRangeValue(alpha, '0')
    expect(onChangeComplete).toHaveBeenCalledTimes(1)
    expect((onChangeComplete.mock.calls[0]![0] as Color).a).toBe(0)

    onChange.mockClear()
    onChangeComplete.mockClear()
    await key(alpha, 'keydown', 'ArrowLeft')
    await key(alpha, 'keyup', 'ArrowLeft')
    expect(onChange).not.toHaveBeenCalled()
    expect(onChangeComplete).not.toHaveBeenCalled()
  })

  it('completes a native Home key change once on key up', async () => {
    const onChangeComplete = vi.fn()
    const { byLabel } = setup(() => <ColorPicker defaultValue={defaultColor} onChangeComplete={onChangeComplete} />)
    const hue = byLabel('Hue')[0]!
    await key(hue, 'keydown', 'Home')
    await setRangeValue(hue, '0')
    expect(onChangeComplete).not.toHaveBeenCalled()
    await key(hue, 'keyup', 'Home')
    expect(onChangeComplete).toHaveBeenCalledTimes(1)
  })

  it('completes the interaction when focus leaves mid-press', async () => {
    const onChangeComplete = vi.fn()
    const { byLabel } = setup(() => <Controlled onChangeComplete={onChangeComplete} />)
    const [saturation, brightness] = byLabel('Color picker')
    await key(saturation!, 'keydown', 'ArrowRight')
    await focusOut(saturation!)
    expect(onChangeComplete).toHaveBeenCalledTimes(1)
    expect(brightness!.getAttribute('aria-hidden')).toBe('true')

    // Nothing in flight: blur does not complete again.
    await focusOut(saturation!)
    expect(onChangeComplete).toHaveBeenCalledTimes(1)
  })

  it('disables the range inputs when disabled', () => {
    setup(() => <ColorPicker defaultValue={defaultColor} disabled />)
    const inputs = document.querySelectorAll<HTMLInputElement>('input[type="range"]')
    expect(inputs).toHaveLength(4)
    inputs.forEach(input => expect(input.disabled).toBe(true))
  })
})

describe('colorBlock', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('renders a div without onClick', () => {
    const wrapper = mount(() => <ColorBlock color="red" prefixCls="vc-color-picker" />)
    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.element.getAttribute('aria-label')).toBeNull()
    expect(wrapper.find('.vc-color-picker-color-block-inner').element.tagName).toBe('DIV')
  })

  it('renders a named native button with onClick', async () => {
    const onClick = vi.fn()
    const wrapper = mount(() => (
      <form onSubmit={(e: Event) => e.preventDefault()}>
        <ColorBlock color="red" prefixCls="vc-color-picker" class="custom" style={{ width: '10px' }} onClick={onClick} />
      </form>
    ))
    const button = wrapper.find('button')
    expect(button.attributes('type')).toBe('button')
    expect(button.attributes('aria-label')).toBe('red')
    expect(button.classes()).toContain('custom')
    expect(button.attributes('style')).toContain('width: 10px')
    expect(button.find('.vc-color-picker-color-block-inner').element.tagName).toBe('SPAN')
    await button.trigger('click')
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('keeps a customized aria-label', () => {
    const wrapper = mount(() => (
      <ColorBlock color="red" prefixCls="vc-color-picker" aria-label="Pick red" onClick={() => {}} />
    ))
    expect(wrapper.find('button').attributes('aria-label')).toBe('Pick red')
  })
})
