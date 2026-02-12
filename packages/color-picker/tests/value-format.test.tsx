import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import ColorPicker, { Color } from '../src'
import Picker from '../src/components/Picker'
import Slider from '../src/components/Slider'

describe('color-picker valueFormat', () => {
  it('emits Color object by default', async () => {
    const wrapper = mount(ColorPicker)
    const picker = wrapper.findComponent(Picker)

    picker.vm.$emit('change', new Color('#00ff00'))
    await nextTick()

    const emittedValue = wrapper.emitted('update:value')?.[0]?.[0]
    expect(emittedValue).toBeInstanceOf(Color)
    expect(emittedValue.toHexString()).toBe('#00ff00')
  })

  it('emits formatted string when valueFormat is hex', async () => {
    const wrapper = mount(ColorPicker, {
      props: {
        valueFormat: 'hex',
      },
    })
    const picker = wrapper.findComponent(Picker)

    picker.vm.$emit('change', new Color('rgba(0, 255, 0, 0.5)'))
    await nextTick()

    expect(wrapper.emitted('change')?.[0]?.[0]).toBe('#00ff0080')
    expect(wrapper.emitted('update:value')?.[0]?.[0]).toBe('#00ff0080')
  })

  it('formats changeComplete from picker and slider', async () => {
    const wrapper = mount(ColorPicker, {
      props: {
        valueFormat: 'rgb',
      },
    })
    const picker = wrapper.findComponent(Picker)
    const sliders = wrapper.findAllComponents(Slider)

    picker.vm.$emit('changeComplete', new Color('#0000ff'))
    sliders[0].vm.$emit('changeComplete', 180)
    await nextTick()

    const [pickerComplete, sliderComplete] = wrapper.emitted('changeComplete') || []

    expect(pickerComplete?.[0]).toBe('rgb(0,0,255)')
    expect(typeof sliderComplete?.[0]).toBe('string')
    expect(sliderComplete?.[1]).toEqual({ type: 'hue', value: 180 })
  })
})
