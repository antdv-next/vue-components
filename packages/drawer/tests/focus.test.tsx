import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick, Teleport } from 'vue'
import Drawer from '../src'

async function flushDrawer() {
  await nextTick()
  vi.runAllTimers()
  await nextTick()
  await nextTick()
}

describe('@v-c/drawer focus', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    document.body.innerHTML = ''
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('keeps focus on a body teleported input', async () => {
    const wrapper = mount(Drawer, {
      attachTo: document.body,
      props: {
        open: true,
        getContainer: false,
      },
      slots: {
        default: () => (
          <>
            <input id="drawer-inline-input" />
            <Teleport to="body">
              <input id="drawer-teleport-input" />
            </Teleport>
          </>
        ),
      },
    })

    await flushDrawer()

    const teleportedInput = document.getElementById('drawer-teleport-input') as HTMLInputElement | null
    const drawerElement = document.querySelector('.vc-drawer')

    expect(teleportedInput).not.toBeNull()
    expect(drawerElement?.contains(teleportedInput!)).toBe(false)

    teleportedInput!.focus()
    await nextTick()

    expect(document.activeElement).toBe(teleportedInput)

    wrapper.unmount()
  })
})
