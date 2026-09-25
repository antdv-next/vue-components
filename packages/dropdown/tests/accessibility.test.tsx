import Menu, { Item as MenuItem } from '@v-c/menu'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick } from 'vue'
import Dropdown from '../src'

/** Let the portal mount and the raf-based autoFocus run. */
async function settle() {
  for (let i = 0; i < 6; i += 1) {
    await nextTick()
  }
  await new Promise(resolve => setTimeout(resolve, 120))
}

function renderMenu() {
  return (
    <Menu>
      <MenuItem key="1">
        <span class="my-menuitem">one</span>
      </MenuItem>
      <MenuItem key="2">two</MenuItem>
    </Menu>
  )
}

function mountDropdown(props: Record<string, any>) {
  return mount(
    defineComponent({
      setup() {
        return () => (
          <Dropdown trigger={['click']} {...props}>
            <button class="my-button">open</button>
          </Dropdown>
        )
      },
    }),
    { attachTo: document.body },
  )
}

function pressTab() {
  const event = new KeyboardEvent('keydown', { keyCode: 9, cancelable: true } as any)
  window.dispatchEvent(event)
  return event
}

describe('dropdown accessibility', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    document.body.innerHTML = ''
  })

  it.each(['direct', 'wrapped'])('should support autoFocus for a %s menu', async (mode) => {
    const focusSpy = vi.spyOn(HTMLElement.prototype, 'focus')
    const wrapper = mountDropdown({
      autoFocus: true,
      overlay: mode === 'wrapped' ? <div>{renderMenu()}</div> : renderMenu(),
    })

    await wrapper.find('.my-button').trigger('click')
    await settle()

    expect(document.querySelector('.vc-dropdown')!.classList.contains('vc-dropdown-hidden')).toBeFalsy()
    expect((document.activeElement as HTMLElement).className).toContain('menu')
    expect(focusSpy).toHaveBeenLastCalledWith({ preventScroll: true })

    // Close menu with Tab
    pressTab()
    await settle()

    expect((document.activeElement as HTMLElement).className).toContain('my-button')

    wrapper.unmount()
  })

  it('does not focus the menu when autoFocus is not set', async () => {
    const focusSpy = vi.spyOn(HTMLElement.prototype, 'focus')
    const wrapper = mountDropdown({ overlay: renderMenu() })

    await wrapper.find('.my-button').trigger('click')
    await settle()

    expect(document.querySelector('.vc-dropdown')!.classList.contains('vc-dropdown-hidden')).toBeFalsy()
    expect((document.activeElement as HTMLElement).className).not.toContain('menu')
    expect(focusSpy).not.toHaveBeenCalledWith({ preventScroll: true })

    wrapper.unmount()
  })

  it.each(['direct', 'wrapped'])('moves focus into a %s menu on Tab', async (mode) => {
    const onOpenChange = vi.fn()
    const wrapper = mountDropdown({
      onOpenChange,
      overlay: mode === 'wrapped' ? <div>{renderMenu()}</div> : renderMenu(),
    })

    await wrapper.find('.my-button').trigger('click')
    await settle()
    onOpenChange.mockClear()

    const event = pressTab()

    expect(event.defaultPrevented).toBe(true)
    expect((document.activeElement as HTMLElement).className).toContain('menu')
    expect(onOpenChange).not.toHaveBeenCalled()

    wrapper.unmount()
  })

  it('closes without consuming Tab when the overlay cannot be focused', async () => {
    const onOpenChange = vi.fn()
    const wrapper = mountDropdown({
      onOpenChange,
      overlay: <div class="plain">menu</div>,
    })

    await wrapper.find('.my-button').trigger('click')
    await settle()

    const event = pressTab()

    expect(event.defaultPrevented).toBe(false)
    expect(onOpenChange).toHaveBeenLastCalledWith(false)

    wrapper.unmount()
  })
})
