import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent } from 'vue'
import useDelayState from '../src/hooks/useDelayState'

/** Mount the hook inside a component so `onBeforeUnmount` has an owner instance. */
function setupHook<T>(defaultValue: T | (() => T)) {
  const captured: { state?: any, setState?: any } = {}
  const wrapper = mount(
    defineComponent({
      setup() {
        const [state, setState] = useDelayState(defaultValue)
        captured.state = state
        captured.setState = setState
        return () => null
      },
    }),
  )
  return { wrapper, ...(captured as { state: any, setState: any }) }
}

describe('useDelayState', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('exposes the default value, resolving a factory', () => {
    const plain = setupHook(1)
    expect(plain.state.value).toBe(1)
    plain.wrapper.unmount()

    const factory = setupHook(() => 'lazy')
    expect(factory.state.value).toBe('lazy')
    factory.wrapper.unmount()
  })

  it('delays the update by one frame by default', () => {
    const { wrapper, state, setState } = setupHook(0)

    setState(1)
    expect(state.value).toBe(0)

    vi.advanceTimersByTime(50)
    expect(state.value).toBe(1)

    wrapper.unmount()
  })

  it('updates immediately when passed `true`', () => {
    const { wrapper, state, setState } = setupHook(0)

    setState(1, true)
    expect(state.value).toBe(1)

    wrapper.unmount()
  })

  it('honours a `ms` delay config', () => {
    const { wrapper, state, setState } = setupHook(0)

    setState(1, { ms: 100 })
    vi.advanceTimersByTime(50)
    expect(state.value).toBe(0)

    vi.advanceTimersByTime(60)
    expect(state.value).toBe(1)

    wrapper.unmount()
  })

  it('replaces a pending update with the latest one', () => {
    const { wrapper, state, setState } = setupHook(0)

    setState(1)
    setState(2)
    vi.advanceTimersByTime(50)

    expect(state.value).toBe(2)

    wrapper.unmount()
  })

  it('accepts an updater function', () => {
    const { wrapper, state, setState } = setupHook(1)

    setState(prev => prev + 10, true)
    expect(state.value).toBe(11)

    wrapper.unmount()
  })

  it('cancels a pending update on unmount', () => {
    const { wrapper, state, setState } = setupHook(0)

    setState(1)
    wrapper.unmount()
    vi.advanceTimersByTime(50)

    expect(state.value).toBe(0)
  })
})
