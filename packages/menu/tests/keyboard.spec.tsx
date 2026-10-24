import KeyCode from '@v-c/util/dist/KeyCode'
import { mount } from '@vue/test-utils'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick, reactive } from 'vue'
import Menu, { MenuItem, SubMenu } from '../src'

const originalOffsetParent = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetParent')

function isHidden(element: HTMLElement | null): boolean {
  if (!element)
    return false
  return element.style?.display === 'none' || isHidden(element.parentElement)
}

beforeAll(() => {
  // jsdom has no layout: emulate `offsetParent` so `isVisible` works like in a
  // browser. Elements inside a `display: none` ancestor (closed inline list)
  // stay invisible.
  Object.defineProperty(HTMLElement.prototype, 'offsetParent', {
    configurable: true,
    get() {
      return isHidden(this) ? null : this.parentElement
    },
  })
})

afterEach(() => {
  document.body.innerHTML = ''
})

afterAll(() => {
  if (originalOffsetParent)
    Object.defineProperty(HTMLElement.prototype, 'offsetParent', originalOffsetParent)
})

async function flush() {
  for (let i = 0; i < 10; i += 1) {
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 10))
  }
}

function keyDown(container: HTMLElement, keyCode: number) {
  const root = container.querySelector<HTMLElement>('ul.vc-menu-root')!
  const activeElement = document.activeElement as HTMLElement | null
  // Fire on the focused menu node like a real keyboard does. Items inside a
  // popup are teleported outside the root list, so the popup list owns them.
  const target
    = activeElement && activeElement !== document.body && activeElement.closest('ul[data-menu-list]')
      ? activeElement
      : root
  const event = new KeyboardEvent('keydown', {
    key: 'ArrowDown',
    bubbles: true,
    cancelable: true,
  })
  Object.defineProperty(event, 'which', { value: keyCode })
  Object.defineProperty(event, 'keyCode', { value: keyCode })
  target.dispatchEvent(event)
}

function isActive(container: HTMLElement, index: number, active = true) {
  const item = container.querySelectorAll('li.vc-menu-item')[index]
  expect(item?.classList.contains('vc-menu-item-active')).toBe(active)
}

function mountMenu(render: () => any) {
  const Comp = defineComponent(() => render)
  return mount(Comp, { attachTo: document.body })
}

describe('menu keyboard', () => {
  it('moves through items with arrow keys and jumps with home / end', async () => {
    const items = reactive(['1', '2', '3'])

    const wrapper = mountMenu(() => (
      <Menu>
        {items.map(i => (
          <MenuItem key={i}>{i}</MenuItem>
        ))}
      </Menu>
    ))
    await flush()

    // First item
    keyDown(document.body, KeyCode.DOWN)
    await flush()
    isActive(document.body, 0)

    // Next item
    keyDown(document.body, KeyCode.DOWN)
    await flush()
    isActive(document.body, 1)

    // Very first item
    keyDown(document.body, KeyCode.HOME)
    await flush()
    isActive(document.body, 0)

    // Very last item
    keyDown(document.body, KeyCode.END)
    await flush()
    isActive(document.body, 2)

    wrapper.unmount()
  })

  it('skips disabled items', async () => {
    const wrapper = mountMenu(() => (
      <Menu defaultActiveFirst>
        <MenuItem key="d1" disabled />
        <MenuItem key="1">1</MenuItem>
        <MenuItem key="d2" disabled />
        <MenuItem key="2">2</MenuItem>
        <MenuItem key="d3" disabled />
      </Menu>
    ))
    await flush()

    // Next item
    keyDown(document.body, KeyCode.DOWN)
    await flush()
    keyDown(document.body, KeyCode.DOWN)
    await flush()
    isActive(document.body, 3)

    // Back to first item
    keyDown(document.body, KeyCode.UP)
    await flush()
    isActive(document.body, 1)

    // To the last available item
    keyDown(document.body, KeyCode.END)
    await flush()
    isActive(document.body, 3)

    // To the first available item
    keyDown(document.body, KeyCode.HOME)
    await flush()
    isActive(document.body, 1)

    wrapper.unmount()
  })

  it('enter opens the sub menu and focuses its first item', async () => {
    const wrapper = mountMenu(() => (
      <Menu>
        <SubMenu key="s1" title="submenu1">
          <MenuItem key="s1-1">1</MenuItem>
        </SubMenu>
      </Menu>
    ))
    await flush()

    // Active first sub menu
    keyDown(document.body, KeyCode.DOWN)
    await flush()

    // Open it
    keyDown(document.body, KeyCode.ENTER)
    await flush()
    expect(document.querySelector('.vc-menu-submenu-open')).toBeTruthy()
    expect(document.activeElement?.textContent).toEqual('1')

    wrapper.unmount()
  })

  it.each([
    ['ltr', KeyCode.RIGHT, KeyCode.LEFT],
    ['rtl', KeyCode.LEFT, KeyCode.RIGHT],
  ])('go to children & back of parent (%s)', async (direction, subKey, parentKey) => {
    const wrapper = mountMenu(() => (
      <Menu mode="vertical" direction={direction as 'ltr' | 'rtl'}>
        <SubMenu key="bamboo" title="Bamboo">
          <SubMenu key="light" title="Light">
            <MenuItem key="little">Little</MenuItem>
          </SubMenu>
        </SubMenu>
      </Menu>
    ))
    await flush()

    // Active first
    keyDown(document.body, KeyCode.DOWN)
    await flush()

    // Open and active sub
    keyDown(document.body, subKey)
    await flush()
    expect(document.querySelector('.vc-menu-submenu-open')).toBeTruthy()
    const activeTitles = document.querySelectorAll('.vc-menu-submenu-active > .vc-menu-submenu-title')
    expect(activeTitles[activeTitles.length - 1]?.textContent).toEqual('Light')

    // Open and active sub
    keyDown(document.body, subKey)
    await flush()
    expect(document.querySelectorAll('.vc-menu-submenu-open')).toHaveLength(2)
    expect(document.activeElement?.textContent).toEqual('Little')

    // Back to parent
    keyDown(document.body, parentKey)
    await flush()
    expect(document.querySelectorAll('.vc-menu-submenu-open')).toHaveLength(1)
    expect(document.querySelector('.vc-menu-item-active')).toBeFalsy()
    expect(document.activeElement?.textContent).toEqual('Light')

    // Back to parent
    keyDown(document.body, parentKey)
    await flush()
    expect(document.querySelector('.vc-menu-submenu-open')).toBeFalsy()
    expect(document.querySelectorAll('.vc-menu-submenu-active')).toHaveLength(1)
    expect(document.activeElement?.textContent).toEqual('Bamboo')

    wrapper.unmount()
  })

  it('inline mode opens with enter and moves into the opened list', async () => {
    const wrapper = mountMenu(() => (
      <Menu mode="inline">
        <MenuItem key="light">Light</MenuItem>
        <SubMenu key="bamboo" title="Bamboo">
          <MenuItem key="little">Little</MenuItem>
        </SubMenu>
      </Menu>
    ))
    await flush()

    // Nothing happen when no control key
    keyDown(document.body, KeyCode.P)
    await flush()
    expect(document.querySelector('.vc-menu-item-active')).toBeFalsy()

    // Active first
    keyDown(document.body, KeyCode.DOWN)
    await flush()
    isActive(document.body, 0)

    // Active next
    keyDown(document.body, KeyCode.DOWN)
    await flush()

    // Right will not open
    keyDown(document.body, KeyCode.RIGHT)
    await flush()
    expect(document.querySelector('.vc-menu-submenu-open')).toBeFalsy()

    // Trigger open
    keyDown(document.body, KeyCode.ENTER)
    await flush()
    expect(document.querySelector('.vc-menu-submenu-open')).toBeTruthy()
    expect(document.querySelector('.vc-menu-submenu')?.classList.contains('vc-menu-submenu-active')).toBe(true)
    isActive(document.body, 1, false)

    // Active sub item
    keyDown(document.body, KeyCode.DOWN)
    await flush()
    isActive(document.body, 1)

    wrapper.unmount()
  })

  it('up focuses the last item', async () => {
    const wrapper = mountMenu(() => (
      <Menu mode="inline">
        <MenuItem key="light">Light</MenuItem>
        <MenuItem key="bamboo">Bamboo</MenuItem>
      </Menu>
    ))
    await flush()

    keyDown(document.body, KeyCode.UP)
    await flush()
    isActive(document.body, 1)

    wrapper.unmount()
  })

  it('focuses the link inside an item', async () => {
    const wrapper = mountMenu(() => (
      <Menu mode="inline">
        <MenuItem key="light">
          <a href="https://ant.design">Light</a>
        </MenuItem>
      </Menu>
    ))
    await flush()

    const focusSpy = vi.spyOn(document.querySelector('a')!, 'focus')

    keyDown(document.body, KeyCode.DOWN)
    await flush()
    expect(focusSpy).toHaveBeenCalled()

    wrapper.unmount()
  })

  it('does not dead loop on parent navigation of a root item', async () => {
    const wrapper = mountMenu(() => (
      <Menu mode="vertical" openKeys={['bamboo']}>
        <MenuItem key="little">Little</MenuItem>
      </Menu>
    ))
    await flush()

    keyDown(document.body, KeyCode.DOWN)
    await flush()
    keyDown(document.body, KeyCode.LEFT)
    await flush()
    keyDown(document.body, KeyCode.RIGHT)
    await flush()
    isActive(document.body, 0)

    wrapper.unmount()
  })

  it('horizontal mode navigates siblings and opens / closes sub menus', async () => {
    const wrapper = mountMenu(() => (
      <Menu mode="horizontal" disabledOverflow>
        <SubMenu key="bamboo" title="Bamboo">
          <MenuItem key="little">Little</MenuItem>
        </SubMenu>
        <MenuItem key="light">Light</MenuItem>
      </Menu>
    ))
    await flush()

    // Left wraps to the last sibling
    keyDown(document.body, KeyCode.LEFT)
    await flush()
    expect(document.activeElement?.textContent).toContain('Light')

    // Right wraps to the first sibling
    keyDown(document.body, KeyCode.RIGHT)
    await flush()
    expect(document.activeElement?.textContent).toContain('Bamboo')

    // Down opens the sub menu and moves to the first child
    keyDown(document.body, KeyCode.DOWN)
    await flush()
    expect(document.querySelector('.vc-menu-submenu-open')).toBeTruthy()
    expect(document.activeElement?.textContent).toEqual('Little')

    // Esc closes and focuses the sub menu title
    keyDown(document.body, KeyCode.ESC)
    await flush()
    expect(document.querySelector('.vc-menu-submenu-open')).toBeFalsy()
    expect(document.activeElement?.textContent).toContain('Bamboo')

    wrapper.unmount()
  })

  it.each([
    ['body', undefined],
    ['parent node', (node: HTMLElement) => node.parentNode as HTMLElement],
  ])('handles each keydown once with popups rendered in %s', async (_, getPopupContainer) => {
    const onKeydown = vi.fn()
    const wrapper = mountMenu(() => (
      <Menu mode="vertical" getPopupContainer={getPopupContainer} onKeydown={onKeydown}>
        <SubMenu key="bamboo" title="Bamboo">
          <MenuItem key="little">Little</MenuItem>
          <SubMenu key="light" title="Light">
            <MenuItem key="a">A</MenuItem>
            <MenuItem key="b">B</MenuItem>
            <MenuItem key="c">C</MenuItem>
          </SubMenu>
        </SubMenu>
      </Menu>
    ))
    await flush()

    // Active first
    keyDown(document.body, KeyCode.DOWN)
    await flush()

    // Open and active sub
    keyDown(document.body, KeyCode.RIGHT)
    await flush()
    expect(document.activeElement?.textContent).toEqual('Little')

    // Next sibling inside the first popup
    keyDown(document.body, KeyCode.DOWN)
    await flush()
    expect(document.activeElement?.textContent).toEqual('Light')

    // Open the nested popup
    keyDown(document.body, KeyCode.RIGHT)
    await flush()
    expect(document.activeElement?.textContent).toEqual('A')

    // Moves exactly one item inside the nested popup
    onKeydown.mockClear()
    keyDown(document.body, KeyCode.DOWN)
    await flush()
    expect(document.activeElement?.textContent).toEqual('B')
    expect(onKeydown).toHaveBeenCalledTimes(1)

    wrapper.unmount()
  })
})
