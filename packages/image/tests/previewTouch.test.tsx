import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import Image from '../src'

// ref: react-component/image#539
describe('preview touchmove', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  function dispatchTouchMove(cancelable: boolean) {
    const event = new Event('touchmove', { bubbles: true, cancelable })
    const preventDefault = vi.fn()
    Object.defineProperty(event, 'preventDefault', { value: preventDefault })
    window.dispatchEvent(event)
    return preventDefault
  }

  it('only prevents default on cancelable touchmove events while preview is open', async () => {
    const wrapper = mount(() => (
      <Image src="src" preview={{ open: true, getContainer: false } as any} />
    ), { attachTo: document.body })
    await nextTick()
    await nextTick()

    expect(dispatchTouchMove(true)).toHaveBeenCalledTimes(1)
    expect(dispatchTouchMove(false)).not.toHaveBeenCalled()
    wrapper.unmount()
  })
})
