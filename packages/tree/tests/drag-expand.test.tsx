import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Tree from '../src'

/**
 * react-component/tree#1072: the delayed drag-enter expansion timer must be
 * cancelled on unmount, and ignored once the drag has ended.
 */
describe('tree delayed drag expansion', () => {
  const treeData = [
    { key: 'drag', title: 'drag' },
    { key: 'drop', title: 'drop', children: [{ key: 'drop-child', title: 'drop-child' }] },
  ]

  function createTree(onExpand: (...args: any[]) => void) {
    return mount(Tree, {
      props: { treeData: treeData as any, draggable: true, onExpand },
    })
  }

  function contentWrappers(wrapper: ReturnType<typeof createTree>) {
    return wrapper.findAll('.vc-tree-node-content-wrapper')
  }

  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('expands the drop target after the drag-enter delay', async () => {
    const onExpand = vi.fn()
    const wrapper = createTree(onExpand)
    const [dragTarget, dropTarget] = contentWrappers(wrapper)

    await dragTarget.trigger('dragstart')
    await dropTarget.trigger('dragenter')
    vi.advanceTimersByTime(800)

    expect(onExpand).toHaveBeenCalledWith(['drop'], expect.objectContaining({ expanded: true }))
    wrapper.unmount()
  })

  it('cancels delayed drag expansion on unmount', async () => {
    const onExpand = vi.fn()
    const wrapper = createTree(onExpand)
    const [dragTarget, dropTarget] = contentWrappers(wrapper)

    await dragTarget.trigger('dragstart')
    await dropTarget.trigger('dragenter')
    wrapper.unmount()
    vi.advanceTimersByTime(800)

    expect(onExpand).not.toHaveBeenCalled()
  })

  it('ignores delayed drag expansion after drag end', async () => {
    const onExpand = vi.fn()
    const wrapper = createTree(onExpand)
    const [dragTarget, dropTarget] = contentWrappers(wrapper)

    await dragTarget.trigger('dragstart')
    await dropTarget.trigger('dragenter')
    await dragTarget.trigger('dragend')
    vi.advanceTimersByTime(800)

    expect(onExpand).not.toHaveBeenCalled()
    wrapper.unmount()
  })
})
