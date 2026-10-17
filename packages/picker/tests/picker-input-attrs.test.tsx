import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import Picker, { RangePicker } from '../src'
import generateConfig from '../src/generate/dayjs'
import enUS from '../src/locale/en_US'

function mountPicker(props: Record<string, any> = {}, component: any = Picker) {
  return mount(component, {
    attachTo: document.body,
    props: {
      generateConfig,
      locale: enUS,
      ...props,
    },
  })
}

function inputs(wrapper: ReturnType<typeof mountPicker>) {
  return wrapper.findAll('input').map(input => input.element as HTMLInputElement)
}

// sync rc-picker `support name & autoComplete prop`
describe('picker input attrs', () => {
  it('defaults autocomplete to off', async () => {
    const single = mountPicker()
    const range = mountPicker({}, RangePicker)
    await nextTick()

    expect(inputs(single).map(el => el.getAttribute('autocomplete'))).toEqual(['off'])
    expect(inputs(range).map(el => el.getAttribute('autocomplete'))).toEqual(['off', 'off'])

    single.unmount()
    range.unmount()
  })

  it.each(['on', 'new-password'])('passes autoComplete="%s" to input', async (autoComplete) => {
    const single = mountPicker({ autoComplete })
    const range = mountPicker({ autoComplete }, RangePicker)
    await nextTick()

    expect(inputs(single).map(el => el.getAttribute('autocomplete'))).toEqual([autoComplete])
    expect(inputs(range).map(el => el.getAttribute('autocomplete'))).toEqual([autoComplete, autoComplete])

    single.unmount()
    range.unmount()
  })

  it('passes name and required to input', async () => {
    const single = mountPicker({ name: 'bamboo', required: true })
    const range = mountPicker({ name: 'bamboo', required: true }, RangePicker)
    await nextTick()

    for (const el of [...inputs(single), ...inputs(range)]) {
      expect(el.getAttribute('name')).toBe('bamboo')
      expect(el.required).toBe(true)
    }

    single.unmount()
    range.unmount()
  })

  it('does not render name or required by default', async () => {
    const single = mountPicker()
    await nextTick()

    const [el] = inputs(single)
    expect(el!.hasAttribute('name')).toBe(false)
    expect(el!.hasAttribute('required')).toBe(false)

    single.unmount()
  })
})
