import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import Tour from '../src'

describe('tour unmount', () => {
  it('does not leave window listeners when unmounted before the deferred binding', async () => {
    const add = vi.spyOn(window, 'addEventListener')
    const remove = vi.spyOn(window, 'removeEventListener')

    // Unmount synchronously: the position listeners are bound after a tick,
    // which must be skipped once the watcher has been cleaned up.
    mount(() => <Tour open steps={[{ title: 'step' }]} />).unmount()
    await nextTick()
    await nextTick()

    const count = (spy: typeof add, type: string) => spy.mock.calls.filter(([t]) => t === type).length
    for (const type of ['resize', 'scroll']) {
      expect(count(add, type)).toBeLessThanOrEqual(count(remove, type))
    }

    add.mockRestore()
    remove.mockRestore()
  })
})
