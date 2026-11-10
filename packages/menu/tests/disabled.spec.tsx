import KeyCode from '@v-c/util/dist/KeyCode'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'
import Menu, { MenuItem, SubMenu } from '../src'

afterEach(() => {
  document.body.innerHTML = ''
})

async function flush() {
  for (let i = 0; i < 10; i += 1) {
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 10))
  }
}

function keyDown(target: HTMLElement, keyCode: number) {
  const event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true })
  Object.defineProperty(event, 'which', { value: keyCode })
  Object.defineProperty(event, 'keyCode', { value: keyCode })
  target.dispatchEvent(event)
}

function mountMenu(render: () => any) {
  return mount(defineComponent(() => render), { attachTo: document.body })
}

function findItem(name: string) {
  return Array.from(document.querySelectorAll<HTMLElement>('[role="menuitem"]'))
    .find(node => node.textContent?.trim() === name)!
}

describe('disabled menu', () => {
  it('exposes inherited disabled state on menu items', async () => {
    const disabled = ref(true)
    const wrapper = mountMenu(() => (
      <Menu disabled={disabled.value}>
        <MenuItem key="inherited">Inherited</MenuItem>
        <MenuItem key="explicit" disabled>Explicit</MenuItem>
      </Menu>
    ))
    await flush()
    expect(findItem('Inherited').getAttribute('aria-disabled')).toBe('true')

    disabled.value = false
    await flush()
    expect(findItem('Inherited').getAttribute('aria-disabled')).not.toBe('true')
    expect(findItem('Explicit').getAttribute('aria-disabled')).toBe('true')
    wrapper.unmount()
  })

  it('does not add aria-disabled to items of an enabled submenu', async () => {
    const wrapper = mountMenu(() => (
      <Menu mode="inline" openKeys={['parent']}>
        <SubMenu key="parent" title="Parent">
          <MenuItem key="child">Child</MenuItem>
        </SubMenu>
      </Menu>
    ))
    await flush()
    expect(findItem('Child').hasAttribute('aria-disabled')).toBe(false)
    wrapper.unmount()
  })

  it('ignores Enter after a focused item becomes disabled', async () => {
    const onSelect = vi.fn()
    const disabled = ref(false)
    const wrapper = mountMenu(() => (
      <Menu disabled={disabled.value} defaultSelectedKeys={['apple']} onSelect={onSelect}>
        <MenuItem key="apple">Apple</MenuItem>
        <MenuItem key="orange">Orange</MenuItem>
      </Menu>
    ))
    await flush()
    const orange = findItem('Orange')
    orange.focus()
    disabled.value = true
    await flush()

    keyDown(orange, KeyCode.ENTER)
    await flush()
    expect(onSelect).not.toHaveBeenCalled()

    disabled.value = false
    await flush()
    keyDown(orange, KeyCode.ENTER)
    await flush()
    expect(onSelect).toHaveBeenCalledTimes(1)
    wrapper.unmount()
  })

  it.each(['inline', 'vertical'] as const)(
    'ignores keyboard opening after a focused %s submenu becomes disabled',
    async (mode) => {
      const onOpenChange = vi.fn()
      const disabled = ref(false)
      const wrapper = mountMenu(() => (
        <Menu mode={mode} disabled={disabled.value} onOpenChange={onOpenChange}>
          <SubMenu key="parent" title="Parent">
            <MenuItem key="child">Child</MenuItem>
          </SubMenu>
        </Menu>
      ))
      await flush()
      const submenu = findItem('Parent')
      submenu.focus()
      disabled.value = true
      await flush()

      const key = mode === 'inline' ? KeyCode.ENTER : KeyCode.RIGHT
      keyDown(submenu, key)
      await flush()
      expect(onOpenChange).not.toHaveBeenCalled()

      disabled.value = false
      await flush()
      keyDown(submenu, key)
      await flush()
      expect(onOpenChange).toHaveBeenCalledWith(['parent'])
      wrapper.unmount()
    },
  )

  it.each(['inline', 'vertical'] as const)(
    'blocks selection in an open %s submenu while it is disabled',
    async (mode) => {
      const onSelect = vi.fn()
      const onOpenChange = vi.fn()
      const disabled = ref(false)
      const wrapper = mountMenu(() => (
        <Menu mode={mode} openKeys={['parent']} onSelect={onSelect} onOpenChange={onOpenChange}>
          <SubMenu key="parent" title="Parent" disabled={disabled.value}>
            <MenuItem key="child">Child</MenuItem>
          </SubMenu>
        </Menu>
      ))
      await flush()
      const item = findItem('Child')
      item.focus()
      disabled.value = true
      await flush()

      expect(item.getAttribute('aria-disabled')).toBe('true')
      expect(item.classList.contains('vc-menu-item-disabled')).toBe(true)
      item.click()
      keyDown(item, KeyCode.ENTER)
      await flush()
      expect(onSelect).not.toHaveBeenCalled()
      expect(onOpenChange).not.toHaveBeenCalled()

      disabled.value = false
      await flush()
      item.click()
      await flush()
      expect(onSelect).toHaveBeenCalledTimes(1)
      wrapper.unmount()
    },
  )
})
