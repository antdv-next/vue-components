import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { h } from 'vue'
import VirtualList from '../List'

const HOLDER = '.vc-virtual-list-holder'
const LEAF = '.leaf'

let wrapper: VueWrapper

async function mountList(render: () => any) {
  const data = Array.from({ length: 100 }, (_, i) => ({ id: i }))

  wrapper = mount(VirtualList, {
    props: { data, height: 100, itemHeight: 20, itemKey: 'id' },
    slots: { default: render },
  })

  // useScrollDrag 的 watcher 在首次 flush 之后才把监听挂到 holder 上
  await wrapper.vm.$nextTick()

  const holder = wrapper.find(HOLDER).element as HTMLDivElement
  vi.spyOn(holder, 'getBoundingClientRect').mockReturnValue({
    x: 0,
    y: 0,
    top: 0,
    left: 0,
    right: 100,
    bottom: 100,
    width: 100,
    height: 100,
    toJSON: () => ({}),
  } as DOMRect)

  return { holder, leaf: holder.querySelector(LEAF) as HTMLElement }
}

function mouseDown(target: Element) {
  target.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, button: 0 }))
}

/** 指针移到列表下边缘之外，触发拖拽滚动 */
function mouseMoveOutside() {
  const event = new MouseEvent('mousemove', { bubbles: true, cancelable: true })
  Object.defineProperty(event, 'pageX', { value: 0 })
  Object.defineProperty(event, 'pageY', { value: 150 })
  document.dispatchEvent(event)
}

function mouseUp() {
  document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }))
}

/** 拖拽滚动走 rAF，等真实计时器跑过几帧 */
function nextFrames() {
  return new Promise(resolve => setTimeout(resolve, 60))
}

afterEach(() => {
  mouseUp()
  wrapper?.unmount()
  vi.restoreAllMocks()
})

describe('virtual-list scroll drag', () => {
  // react-component/virtual-list#386
  it('skips drag-scroll when an ancestor of the target is draggable', async () => {
    const { holder, leaf } = await mountList(() =>
      h('div', { draggable: true }, [h('span', { class: 'leaf' }, 'draggable node')]),
    )

    mouseDown(leaf)
    mouseMoveOutside()
    await nextFrames()

    expect(holder.scrollTop).toBe(0)
  })

  // react-component/virtual-list#386：原有行为必须保持
  it('skips drag-scroll when the target itself is draggable', async () => {
    const { holder, leaf } = await mountList(() =>
      h('div', null, [h('span', { class: 'leaf', draggable: true }, 'draggable node')]),
    )

    mouseDown(leaf)
    mouseMoveOutside()
    await nextFrames()

    expect(holder.scrollTop).toBe(0)
  })

  it('still drag-scrolls when nothing in the path is draggable', async () => {
    const { holder, leaf } = await mountList(() =>
      h('div', null, [h('span', { class: 'leaf' }, 'plain node')]),
    )

    mouseDown(leaf)
    mouseMoveOutside()
    await nextFrames()

    expect(holder.scrollTop).toBeGreaterThan(0)
  })
})
