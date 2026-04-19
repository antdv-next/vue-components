import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick, ref, Teleport } from 'vue'
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

  it('does not trigger close icon when pressing Enter after click open', async () => {
    let closeCount = 0
    const rectSpy = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(() => {
      return {
        x: 0,
        y: 0,
        width: 100,
        height: 40,
        top: 0,
        right: 100,
        bottom: 40,
        left: 0,
        toJSON: () => {},
      } as DOMRect
    })

    const Demo = defineComponent({
      setup() {
        const open = ref(false)

        const openByClick = () => {
          open.value = true
        }

        const closeByIcon = () => {
          closeCount += 1
          open.value = false
        }

        const closeByIconEnter = (event: KeyboardEvent) => {
          if (event.key === 'Enter') {
            closeByIcon()
          }
        }

        return () => (
          <>
            <button id="drawer-open-trigger" type="button" onClick={openByClick}>
              open
            </button>
            <Drawer open={open.value} getContainer={false} destroyOnHidden>
              <button
                id="drawer-close-icon"
                type="button"
                onClick={closeByIcon}
                onKeydown={closeByIconEnter}
              >
                close icon
              </button>
            </Drawer>
          </>
        )
      },
    })

    const wrapper = mount(Demo, {
      attachTo: document.body,
    })

    const triggerButton = document.getElementById('drawer-open-trigger') as HTMLButtonElement | null
    expect(triggerButton).not.toBeNull()

    triggerButton!.click()
    await flushDrawer()

    const closeIcon = document.getElementById('drawer-close-icon') as HTMLButtonElement | null
    expect(document.querySelector('.vc-drawer-open')).not.toBeNull()
    expect(closeIcon).not.toBeNull()

    expect(document.activeElement).not.toBe(closeIcon)

    document.activeElement?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))

    await flushDrawer()

    expect(closeCount).toBe(0)
    expect(document.querySelector('.vc-drawer-open')).not.toBeNull()

    wrapper.unmount()
    rectSpy.mockRestore()
  })
})
