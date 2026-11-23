import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import VirtualList from '../src/List'

// ref: react-component/virtual-list#396
describe('scrollbar touch during a momentum scroll', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    vi.restoreAllMocks()
  })

  async function genList() {
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(20)
    vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(100)
    const data = Array.from({ length: 100 }).map((_, id) => ({ id }))
    const wrapper = mount(VirtualList, {
      props: { data, height: 100, itemHeight: 20, itemKey: 'id' },
      slots: { default: ({ item }: any) => <div style={{ height: '20px' }}>{item.id}</div> },
      attachTo: document.body,
    })
    await nextTick()
    await nextTick()
    return wrapper
  }

  // While a fling is running the browser dispatches touchstart with cancelable=false
  function dispatchUncancelableTouchStart(element: Element) {
    const preventDefault = vi.fn()
    const touchEvent = new Event('touchstart', { bubbles: true, cancelable: false })
    Object.defineProperty(touchEvent, 'touches', { value: [{ pageX: 0, pageY: 0 }] })
    Object.defineProperty(touchEvent, 'preventDefault', { value: preventDefault })
    element.dispatchEvent(touchEvent)
    return preventDefault
  }

  it('does not preventDefault on the track', async () => {
    const wrapper = await genList()
    const preventDefault = dispatchUncancelableTouchStart(
      wrapper.find('.vc-virtual-list-scrollbar').element,
    )
    expect(preventDefault).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('does not preventDefault on the thumb but still starts dragging', async () => {
    const wrapper = await genList()
    const preventDefault = dispatchUncancelableTouchStart(
      wrapper.find('.vc-virtual-list-scrollbar-thumb').element,
    )
    await nextTick()
    expect(preventDefault).not.toHaveBeenCalled()
    expect(wrapper.find('.vc-virtual-list-scrollbar-thumb-moving').exists()).toBe(true)
    wrapper.unmount()
  })

  it('disables native panning on the scrollbar', async () => {
    const wrapper = await genList()
    const scrollbar = wrapper.find('.vc-virtual-list-scrollbar').element as HTMLElement
    expect(scrollbar.style.touchAction).toBe('none')
    wrapper.unmount()
  })
})
