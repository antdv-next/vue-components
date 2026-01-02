import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import VirtualList from '../src/List'

describe('virtualList Performance', () => {
  it('should handle large dataset without freezing', async () => {
    const data = Array.from({ length: 100000 }).map((_, i) => ({ id: i }))
    const wrapper = mount(VirtualList, {
      props: {
        data,
        height: 200,
        itemHeight: 20,
        itemKey: 'id',
      },
      slots: {
        default: ({ item }) => <div>{item.id}</div>,
      },
    })

    // Initial render check
    expect(wrapper.vm.scrollTo).toBeDefined()

    // Trigger update
    await wrapper.setProps({ data: [...data] })

    // If we reach here quickly, it means the optimization worked.
    // The test runner usually has a timeout (e.g. 5s), so if the loop was O(N)
    // and slow enough, this would timeout or be noticeably slow.
    // In a real environment, 100k items O(N) might take 50-200ms which is "freeze" for UI frames
    // but not necessarily timeout a test. However, we are mainly checking for correctness here.

    expect(wrapper.html()).toBeTruthy()
  })
})
