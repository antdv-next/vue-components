import { resetWarned } from '@v-c/util/dist/warning'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'
import Picker, { RangePicker } from '../src'
import generateConfig from '../src/generate/dayjs'
import enUS from '../src/locale/en_US'

// sync rc-picker#990: accessible footer actions
function tagComponent(tag: string) {
  return defineComponent({
    inheritAttrs: false,
    setup: (_, { attrs, slots }) => () => h(tag, attrs, slots.default?.()),
  })
}

async function flush() {
  for (let i = 0; i < 3; i += 1) {
    await nextTick()
    await new Promise(resolve => setTimeout(resolve))
  }
}

describe.each([
  ['Picker', Picker],
  ['RangePicker', RangePicker],
] as const)('%s footer buttons', (_, Component) => {
  beforeEach(() => {
    resetWarned()
  })
  afterEach(() => {
    document.body.innerHTML = ''
    vi.restoreAllMocks()
  })

  function render(components?: Record<string, any>) {
    return mount(Component as any, {
      attachTo: document.body,
      props: { generateConfig, locale: enUS, picker: 'time', showNow: true, open: true, components },
    })
  }

  it('renders native buttons without list wrappers by default', async () => {
    const wrapper = render()
    await flush()
    const ranges = document.querySelector('.vc-picker-ranges')!
    expect(ranges.tagName).toBe('DIV')
    expect(ranges.querySelector('li')).toBeNull()
    const now = document.querySelector('.vc-picker-now')!
    expect(now.tagName).toBe('BUTTON')
    expect(now.getAttribute('type')).toBe('button')
    const ok = document.querySelector('.vc-picker-ok')!
    expect(ok.tagName).toBe('BUTTON')
    expect(ok.getAttribute('type')).toBe('button')
    wrapper.unmount()
  })

  it('supports okButton and falls back to legacy button with a warning', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const wrapper = render({ button: tagComponent('h1') })
    await flush()
    const ok = document.querySelector('.vc-picker-ok')!
    expect(ok.tagName).toBe('H1')
    expect(ok.hasAttribute('type')).toBe(false)
    expect(document.querySelector('.vc-picker-now')!.tagName).toBe('BUTTON')
    expect(errorSpy).toHaveBeenCalledWith(
      'Warning: \'components.button\' is deprecated. Please use \'components.okButton\' instead.',
    )
    wrapper.unmount()
  })

  it('lets okButton override the legacy button', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const wrapper = render({ button: tagComponent('h1'), okButton: tagComponent('h3') })
    await flush()
    expect(document.querySelector('.vc-picker-footer h1')).toBeNull()
    expect(document.querySelector('.vc-picker-ok')!.tagName).toBe('H3')
    wrapper.unmount()
  })

  it('supports a custom nowButton', async () => {
    const wrapper = render({ nowButton: tagComponent('h2') })
    await flush()
    const now = document.querySelector('.vc-picker-now')!
    expect(now.tagName).toBe('H2')
    expect(now.hasAttribute('type')).toBe(false)
    expect(document.querySelector('.vc-picker-ok')!.tagName).toBe('BUTTON')
    wrapper.unmount()
  })
})
