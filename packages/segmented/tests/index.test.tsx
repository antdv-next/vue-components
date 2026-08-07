import { mount } from '@vue/test-utils'
import { describe, expect, it, vitest } from 'vitest'
import { nextTick } from 'vue'
import Segmented from '../src'

describe('segmented', () => {
  it('should select the first option by default when no value/defaultValue is provided', () => {
    const wrapper = mount(<Segmented options={['a', 'b', 'c']} />)
    const inputs = wrapper.findAll('.vc-segmented-item-input')
    expect((inputs[0].element as HTMLInputElement).checked).toBe(true)
    expect((inputs[1].element as HTMLInputElement).checked).toBe(false)
    expect((inputs[2].element as HTMLInputElement).checked).toBe(false)
  })

  it('should select the first option by default with object options', () => {
    const wrapper = mount(
      <Segmented
        options={[
          { label: 'A', value: 'a' },
          { label: 'B', value: 'b' },
        ]}
      />,
    )
    const inputs = wrapper.findAll('.vc-segmented-item-input')
    expect((inputs[0].element as HTMLInputElement).checked).toBe(true)
    expect((inputs[1].element as HTMLInputElement).checked).toBe(false)
  })

  it('should keep selected item when controlled value is not updated after click', async () => {
    const onChange = vitest.fn()
    const wrapper = mount(
      <Segmented
        value="a"
        options={['a', 'b', 'c']}
        onChange={onChange}
      />,
    )

    const inputs = wrapper.findAll('.vc-segmented-item-input')
    const nextInput = inputs[1].element as HTMLInputElement
    nextInput.checked = true
    await inputs[1].trigger('change')
    await nextTick()
    await nextTick()

    const updatedInputs = wrapper.findAll('.vc-segmented-item-input')
    expect(onChange).toHaveBeenCalledWith('b')
    expect((updatedInputs[0].element as HTMLInputElement).checked).toBe(true)
    expect((updatedInputs[1].element as HTMLInputElement).checked).toBe(false)
  })

  it('should keep selected item when controlled value is not updated after keyboard change', async () => {
    const onChange = vitest.fn()
    const wrapper = mount(
      <Segmented
        value="a"
        options={['a', 'b', 'c']}
        onChange={onChange}
      />,
    )

    const inputs = wrapper.findAll('.vc-segmented-item-input')
    await inputs[0].trigger('keydown', { key: 'ArrowRight' })
    await nextTick()
    await nextTick()

    expect(onChange).toHaveBeenCalledWith('b')
    expect((inputs[0].element as HTMLInputElement).checked).toBe(true)
    expect((inputs[1].element as HTMLInputElement).checked).toBe(false)
  })

  it('should not select a disabled option when it is the only next item', async () => {
    const onChange = vitest.fn()
    const wrapper = mount(
      <Segmented
        options={[
          { label: 'Enabled', value: 'enabled' },
          { label: 'Disabled', value: 'disabled', disabled: true },
        ]}
        defaultValue="enabled"
        onChange={onChange}
      />,
    )

    const inputs = wrapper.findAll('.vc-segmented-item-input')
    await inputs[0].trigger('keydown', { key: 'ArrowRight' })
    await nextTick()

    expect(onChange).not.toHaveBeenCalled()
    expect((inputs[0].element as HTMLInputElement).checked).toBe(true)
    expect((inputs[1].element as HTMLInputElement).checked).toBe(false)
  })
})
