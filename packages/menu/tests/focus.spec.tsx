import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import Menu from '../src'

const items = [
  { key: 'light', label: 'Light' },
  { key: 'bamboo', label: 'Bamboo' },
  { key: 'little', label: 'Little' },
]

async function flush() {
  for (let i = 0; i < 4; i += 1) {
    await nextTick()
  }
}

function mountMenu(props: Record<string, any> = {}) {
  return mount(Menu, {
    props: { items, ...props },
    attachTo: document.body,
  })
}

describe('menu focus', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('exposes the rendered ul as `list`', async () => {
    const wrapper = mountMenu()
    await flush()

    const list = (wrapper.vm as any).list
    expect(list).toBeInstanceOf(HTMLUListElement)
    expect(list).toBe(wrapper.find('ul.vc-menu').element)

    wrapper.unmount()
  })

  it('focuses the first item via ref focus()', async () => {
    const wrapper = mountMenu()
    await flush()

    expect(() => (wrapper.vm as any).focus()).not.toThrow()
    expect(document.activeElement).toBe(wrapper.findAll('li.vc-menu-item')[0]!.element)

    wrapper.unmount()
  })
})
