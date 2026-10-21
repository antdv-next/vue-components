import type { Ref } from 'vue'
import type { MenuMode } from '../interface'
import { getFocusNodeList } from '@v-c/util/dist/Dom/focus'
import KeyCode from '@v-c/util/dist/KeyCode'
import { onBeforeUnmount, shallowRef } from 'vue'
import { getMenuId } from '../context/IdContext'

// destruct to reduce minify size
const { LEFT, RIGHT, UP, DOWN, ENTER, ESC, HOME, END } = KeyCode

const ArrowKeys = [UP, DOWN, LEFT, RIGHT]

function getOffset(
  mode: MenuMode,
  isRootLevel: boolean,
  isRtl: boolean,
  which: number,
): { offset?: number, sibling?: boolean, inlineTrigger?: boolean } | null {
  const prev = 'prev' as const
  const next = 'next' as const
  const children = 'children' as const
  const parent = 'parent' as const

  // Inline enter is special that we use unique operation
  if (mode === 'inline' && which === ENTER) {
    return { inlineTrigger: true }
  }

  type OffsetMap = Record<number, 'prev' | 'next' | 'children' | 'parent'>
  const inline: OffsetMap = { [UP]: prev, [DOWN]: next }
  const horizontal: OffsetMap = {
    [LEFT]: isRtl ? next : prev,
    [RIGHT]: isRtl ? prev : next,
    [DOWN]: children,
    [ENTER]: children,
  }
  const vertical: OffsetMap = {
    [UP]: prev,
    [DOWN]: next,
    [ENTER]: children,
    [ESC]: parent,
    [LEFT]: isRtl ? children : parent,
    [RIGHT]: isRtl ? parent : children,
  }

  const offsets: Record<string, Record<number, 'prev' | 'next' | 'children' | 'parent'>> = {
    inline,
    horizontal,
    vertical,
    inlineSub: inline,
    horizontalSub: vertical,
    verticalSub: vertical,
  }

  const type = offsets[`${mode}${isRootLevel ? '' : 'Sub'}`]?.[which]

  switch (type) {
    case prev:
      return { offset: -1, sibling: true }

    case next:
      return { offset: 1, sibling: true }

    case parent:
      return { offset: -1, sibling: false }

    case children:
      return { offset: 1, sibling: false }

    default:
      return null
  }
}

function findContainerUL(element: HTMLElement): HTMLUListElement | null {
  let current: HTMLElement | null = element
  while (current) {
    if (current.getAttribute('data-menu-list')) {
      return current as HTMLUListElement
    }

    current = current.parentElement
  }

  return null
}

/**
 * Find focused element within element set provided
 */
function getFocusElement(activeElement: HTMLElement | null, elements: Set<HTMLElement>): HTMLElement | null {
  let current = activeElement || document.activeElement

  while (current) {
    if (elements.has(current as HTMLElement)) {
      return current as HTMLElement
    }

    current = current.parentElement
  }

  return null
}

/**
 * Get focusable elements from the element set under provided container
 */
export function getFocusableElements(container: HTMLElement | null, elements: Set<HTMLElement>) {
  if (!container)
    return []
  // `getFocusNodeList` skips nodes hidden by an ancestor (e.g. items of a
  // closed inline sub menu), which a plain `[tabindex]` selector would include.
  const list = getFocusNodeList(container, true)
  return list.filter(ele => elements.has(ele))
}

function getNextFocusElement(
  parentQueryContainer: HTMLElement | null,
  elements: Set<HTMLElement>,
  focusMenuElement?: HTMLElement | null,
  offset: number = 1,
) {
  // Key on the menu item will not get validate parent container
  if (!parentQueryContainer) {
    return null
  }

  // List current level menu item elements
  const sameLevelFocusableMenuElementList = getFocusableElements(parentQueryContainer, elements)

  // Find next focus index
  const count = sameLevelFocusableMenuElementList.length
  let focusIndex = sameLevelFocusableMenuElementList.findIndex(ele => focusMenuElement === ele)

  if (offset < 0) {
    if (focusIndex === -1) {
      focusIndex = count - 1
    }
    else {
      focusIndex -= 1
    }
  }
  else if (offset > 0) {
    focusIndex += 1
  }

  focusIndex = (focusIndex + count) % count

  // Focus menu item
  return sameLevelFocusableMenuElementList[focusIndex]
}

export function refreshElements(keys: string[], id: string) {
  const elements = new Set<HTMLElement>()
  const key2element = new Map<string, HTMLElement>()
  const element2key = new Map<HTMLElement, string>()

  keys.forEach((key) => {
    const element = document.querySelector(`[data-menu-id='${getMenuId(id, key)}']`) as HTMLElement

    if (element) {
      elements.add(element)
      element2key.set(element, key)
      key2element.set(key, element)
    }
  })

  return { elements, key2element, element2key }
}

export default function useAccessibility(
  mode: Ref<MenuMode>,
  activeKey: Ref<string>,
  isRtl: Ref<boolean>,
  id: string,

  containerRef: Ref<HTMLUListElement | null>,
  getKeys: () => string[],
  getKeyPath: (key: string, includeOverflow?: boolean) => string[],

  triggerActiveKey: (key: string) => void,
  triggerAccessibilityOpen: (key: string, open?: boolean) => void,

  originOnKeyDown?: (e: KeyboardEvent) => void,
): (e: KeyboardEvent) => void {
  const rafRef = shallowRef<number>()

  const cleanRaf = () => {
    if (rafRef.value !== undefined) {
      cancelAnimationFrame(rafRef.value)
    }
  }

  onBeforeUnmount(() => {
    cleanRaf()
  })

  return (e: KeyboardEvent) => {
    const { which } = e as any

    if ([...ArrowKeys, ENTER, ESC, HOME, END].includes(which)) {
      const keys = getKeys()

      let refreshedElements = refreshElements(keys, id)
      const { elements, key2element, element2key } = refreshedElements

      // First we should find current focused MenuItem/SubMenu element
      const activeElement = key2element.get(activeKey.value)
      const focusMenuElement = getFocusElement(activeElement || null, elements)
      const focusMenuKey = element2key.get(focusMenuElement!)

      const offsetObj = getOffset(mode.value, getKeyPath(focusMenuKey!, true).length === 1, isRtl.value, which)

      // Some mode do not have fully arrow operation like inline
      if (!offsetObj && which !== HOME && which !== END) {
        return
      }

      // Arrow prevent default to avoid page scroll
      if (ArrowKeys.includes(which) || [HOME, END].includes(which)) {
        e.preventDefault()
      }

      const tryFocus = (
        menuElement: HTMLElement | null | undefined,
        elementKeyMap: Map<HTMLElement, string> = element2key,
      ) => {
        if (menuElement) {
          let focusTargetElement = menuElement

          // Focus to link instead of menu item if possible
          const link = menuElement.querySelector('a')
          if (link?.getAttribute('href')) {
            focusTargetElement = link
          }

          const targetKey = elementKeyMap.get(menuElement)
          if (targetKey) {
            triggerActiveKey(targetKey)
          }

          // `triggerActiveKey` updates the active key synchronously, so the
          // latest value (not the one captured before this keydown) must be
          // compared here.
          cleanRaf()
          rafRef.value = requestAnimationFrame(() => {
            if (activeKey.value === targetKey) {
              focusTargetElement.focus()
            }
          })
        }
      }

      if ([HOME, END].includes(which) || offsetObj?.sibling || !focusMenuElement) {
        // ========================== Sibling ==========================
        // Find walkable focus menu element container
        let parentQueryContainer: HTMLElement | null
        if (!focusMenuElement || mode.value === 'inline') {
          parentQueryContainer = containerRef.value
        }
        else {
          parentQueryContainer = findContainerUL(focusMenuElement)
        }

        // Get next focus element
        let targetElement: HTMLElement | null | undefined
        const focusableElements = getFocusableElements(parentQueryContainer, elements)
        if (which === HOME) {
          targetElement = focusableElements[0]
        }
        else if (which === END) {
          targetElement = focusableElements[focusableElements.length - 1]
        }
        else {
          targetElement = getNextFocusElement(
            parentQueryContainer,
            elements,
            focusMenuElement,
            offsetObj?.offset,
          )
        }
        // Focus menu item
        tryFocus(targetElement)

        // ======================= InlineTrigger =======================
      }
      else if (offsetObj!.inlineTrigger) {
        // Inline trigger no need switch to sub menu item
        triggerAccessibilityOpen(focusMenuKey!)
        // =========================== Level ===========================
      }
      else if (offsetObj!.offset! > 0) {
        triggerAccessibilityOpen(focusMenuKey!, true)

        // In Vue the popup is mounted by the trigger on a later frame, so keep
        // retrying until the sub menu list is in the DOM instead of checking
        // exactly one frame after opening.
        let retryCount = 0
        const focusSubMenuItem = () => {
          // Async should resync elements
          refreshedElements = refreshElements(keys, id)

          const controlId = focusMenuElement!.getAttribute('aria-controls')
          const subQueryContainer = controlId ? document.getElementById(controlId) : null

          // Get sub focusable menu item
          const targetElement = getNextFocusElement(subQueryContainer, refreshedElements.elements)

          if (!targetElement && retryCount < 5) {
            retryCount += 1
            cleanRaf()
            rafRef.value = requestAnimationFrame(focusSubMenuItem)
            return
          }

          // Focus menu item
          tryFocus(targetElement, refreshedElements.element2key)
        }

        cleanRaf()
        rafRef.value = requestAnimationFrame(focusSubMenuItem)
      }
      else if (offsetObj!.offset! < 0) {
        const keyPath = getKeyPath(focusMenuKey!, true)
        const parentKey = keyPath[keyPath.length - 2]

        const parentMenuElement = key2element.get(parentKey)

        // Focus menu item
        triggerAccessibilityOpen(parentKey, false)
        tryFocus(parentMenuElement)
      }
    }

    // Pass origin key down event
    originOnKeyDown?.(e)
  }
}
