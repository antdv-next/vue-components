import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick, shallowRef } from 'vue'
import useOpen from '../src/hooks/useOpen'

async function flushSelect() {
  await nextTick()
  await new Promise(resolve => setTimeout(resolve))
  await nextTick()
}

function keyDown(element: HTMLElement, keyCode: number) {
  const event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true })
  Object.defineProperty(event, 'which', { value: keyCode })
  Object.defineProperty(event, 'keyCode', { value: keyCode })
  element.dispatchEvent(event)
}

afterEach(() => {
  document.body.innerHTML = ''
})

// react-component/select#1262
describe('useOpen releases lock when delayed close is canceled', () => {
  function mountHook(open?: boolean) {
    const onOpen = vi.fn()
    let result!: ReturnType<typeof useOpen>
    const Demo = defineComponent({
      setup() {
        result = useOpen(true, shallowRef(open as boolean), onOpen, value => value)
        return () => null
      },
    })
    const wrapper = mount(Demo)
    return { wrapper, onOpen, get: () => result }
  }

  it.each([undefined, true])('unlocks a canceled close with open=%s', async (open) => {
    const { wrapper, onOpen, get } = mountHook(open)
    const cancelFun = vi.fn(() => true)

    get()[2](false, { cancelFun })
    expect(get()[3].value).toBe(true)
    expect(cancelFun).not.toHaveBeenCalled()

    await vi.waitFor(() => expect(cancelFun).toHaveBeenCalled())
    await flushSelect()

    expect(cancelFun).toHaveBeenCalledTimes(1)
    expect(get()[1].value).toBe(true)
    expect(get()[3].value).toBe(false)
    expect(onOpen).not.toHaveBeenCalled()

    wrapper.unmount()
  })

  it('closes and unlocks when not canceled', async () => {
    const { wrapper, onOpen, get } = mountHook()

    get()[2](false, { cancelFun: () => false })
    expect(get()[1].value).toBe(true)
    expect(get()[3].value).toBe(true)

    await vi.waitFor(() => expect(onOpen).toHaveBeenCalled())

    expect(get()[1].value).toBe(false)
    expect(get()[3].value).toBe(false)
    expect(onOpen).toHaveBeenCalledTimes(1)
    expect(onOpen).toHaveBeenCalledWith(false)

    wrapper.unmount()
  })
})
