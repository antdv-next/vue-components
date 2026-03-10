// @vitest-environment jsdom

import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'
import { _rs } from '@v-c/resize-observer'
import Overflow from '../src'

interface ItemType {
  key: string
  label: string
}

async function flushOverflow() {
  await nextTick()
  await Promise.resolve()
  await new Promise(resolve => setTimeout(resolve))
  await nextTick()
}

function mockElementSize(element: HTMLElement, width: number, height = 20) {
  Object.defineProperty(element, 'clientWidth', {
    configurable: true,
    get: () => width,
  })
  Object.defineProperty(element, 'offsetWidth', {
    configurable: true,
    get: () => width,
  })
  Object.defineProperty(element, 'offsetHeight', {
    configurable: true,
    get: () => height,
  })
  element.getBoundingClientRect = () =>
    ({
      width,
      height,
      top: 0,
      left: 0,
      right: width,
      bottom: height,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    }) as DOMRect
}

describe('Overflow responsive', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('keeps the last item hidden until its responsive width is measured', async () => {
    const value = ref<ItemType[]>([
      { key: 'a', label: 'A' },
      { key: 'b', label: 'B' },
    ])

    const App = defineComponent(() => {
      return () => (
        <Overflow
          data={value.value}
          itemKey="key"
          maxCount="responsive"
          renderItem={(item: ItemType) => item.label}
        />
      )
    })

    const wrapper = mount(App, {
      attachTo: document.body,
    })

    await flushOverflow()

    const root = wrapper.get('.vc-overflow').element as HTMLElement
    mockElementSize(root, 40)
    _rs?.([{ target: root } as ResizeObserverEntry])
    await flushOverflow()

    const getItemNodes = () =>
      Array.from(root.querySelectorAll('.vc-overflow-item'))
        .filter(node => !node.classList.contains('vc-overflow-item-rest')) as HTMLElement[]

    const initialItemNodes = getItemNodes()
    mockElementSize(initialItemNodes[0], 20)
    mockElementSize(initialItemNodes[1], 20)
    _rs?.(initialItemNodes.slice(0, 2).map(target => ({ target }) as ResizeObserverEntry))
    await flushOverflow()

    value.value = [
      ...value.value,
      { key: 'c', label: 'C' },
    ]
    await flushOverflow()

    const itemNodes = getItemNodes()
    expect(itemNodes).toHaveLength(3)
    expect(itemNodes[2].textContent).toBe('C')
    expect(itemNodes[2].getAttribute('aria-hidden')).toBe('true')

    wrapper.unmount()
  })
})
