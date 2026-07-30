import type { TabsProps } from '../src'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import Tabs from '../src'

function isVisuallyHidden(el: HTMLElement) {
  return el.style.display === 'none' || el.classList.contains('vc-tabs-content-hidden')
}

describe('pR #64 verification: animated + forceRender', () => {
  it('inactive forceRender pane must stay visually hidden in animated mode', () => {
    const items: NonNullable<TabsProps['items']> = [
      { key: '1', label: 'tab 1', children: h('div', 'content 1') },
      { key: '2', label: 'tab 2', children: h('div', 'content 2'), forceRender: true },
    ]

    const wrapper = mount(Tabs, {
      props: { activeKey: '1', items, animated: { tabPane: true } },
    })

    const panes = wrapper.findAll('.vc-tabs-content')
    expect(panes.length).toBe(2)

    const inactivePane = panes.find(p => !p.classes().includes('vc-tabs-content-active'))!
    expect(inactivePane).toBeTruthy()
    expect(isVisuallyHidden(inactivePane.element as HTMLElement)).toBe(true)
  })
})
