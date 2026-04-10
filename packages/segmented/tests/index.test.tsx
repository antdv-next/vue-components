import { mount } from '@vue/test-utils'
import { describe, expect, it, vitest } from 'vitest'
import { nextTick } from 'vue'
import Segmented from '../src'

describe('segmented', () => {
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
