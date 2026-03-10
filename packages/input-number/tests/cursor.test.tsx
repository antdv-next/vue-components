import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'
import InputNumber from '../src'

describe('input-number cursor', () => {
  it('keeps cursor position when formatter updates a controlled value', async () => {
    const Demo = defineComponent(() => {
      const value = ref<number | null>(1000)

      return () => (
        <InputNumber
          v-model:value={value.value}
          formatter={(cell: string) => `$ ${cell}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={(cell?: string) => cell?.replace(/\$\s?|(,*)/g, '') ?? ''}
        />
      )
    })

    const wrapper = mount(Demo, {
      attachTo: document.body,
    })

    const input = wrapper.find('input')
    input.element.focus()
    await nextTick()

    input.element.value = '$ 12,000'
    input.element.setSelectionRange(4, 4)
    await input.trigger('input')
    await nextTick()
    await nextTick()

    expect(input.element.value).toBe('$ 12,000')
    expect(input.element.selectionStart).toBe(4)
    expect(input.element.selectionEnd).toBe(4)

    wrapper.unmount()
  })
})
