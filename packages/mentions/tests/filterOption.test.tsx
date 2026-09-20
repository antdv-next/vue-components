import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import Mentions from '../src'

const options = [
  { value: 'light', label: 'Light' },
  { value: 'bamboo', label: 'Bamboo' },
]

function mountMentions(filterOption: any) {
  return mount(Mentions, {
    attachTo: document.body,
    props: {
      defaultValue: '@b',
      filterOption,
      options,
    },
  })
}

async function search(wrapper: ReturnType<typeof mountMentions>) {
  const textarea = wrapper.find('textarea').element
  const keyup = new KeyboardEvent('keyup', { key: 'b', bubbles: true })
  Object.defineProperty(keyup, 'which', { value: 66 })
  textarea.dispatchEvent(keyup)
  await nextTick()
}

function renderedOptions() {
  return Array.from(document.body.querySelectorAll('.vc-mentions-dropdown-menu-item'))
    .map(item => item.textContent?.trim())
}

describe('mentions filterOption', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('uses the default filter when filterOption is undefined', async () => {
    const wrapper = mountMentions(undefined)
    await search(wrapper)

    expect(renderedOptions()).toEqual(['Bamboo'])
    wrapper.unmount()
  })

  it('returns all options when filterOption is false', async () => {
    const wrapper = mountMentions(false)
    await search(wrapper)

    expect(renderedOptions()).toEqual(['Light', 'Bamboo'])
    wrapper.unmount()
  })

  it('uses a custom filter function when provided', async () => {
    const wrapper = mountMentions((_, option: { label: string }) =>
      option.label.toLowerCase().startsWith('l'))
    await search(wrapper)

    expect(renderedOptions()).toEqual(['Light'])
    wrapper.unmount()
  })
})
