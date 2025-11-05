import { getFocusNodeList } from '@v-c/util/dist/Dom/focus'
import KeyCode from '@v-c/util/dist/KeyCode'
import raf from '@v-c/util/dist/raf'
import type { Ref } from 'vue'
import type { MenuMode } from '../interface'
import { getMenuId } from '../context/IdContext'

const { LEFT, RIGHT, UP, DOWN, ENTER, ESC, HOME, END } = KeyCode

const ArrowKeys = [UP, DOWN, LEFT, RIGHT]

function getOffset(
  mode: MenuMode,
  isRootLevel: boolean,
  isRtl: boolean,
  which: number,
): { offset?: number; sibling?: boolean; inlineTrigger?: boolean } | null {
  const prev = 'prev' as const
  const next = 'next' as const
  const children = 'children' as const
  const parent = 'parent' as const

  if (mode === 'inline' && which === ENTER) {
    return { inlineTrigger: true }
  }

  type OffsetMap = Record<number, typeof prev | typeof next | typeof children | typeof parent>
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

  const offsets: Record<string, OffsetMap> = {
    inline,
    horizontal,
    vertical,
    inlineSub: inline,
    horizontalSub: vertical,
    verticalSub: vertical,
  }

  const key = `${mode}${isRootLevel ? '' : 'Sub'}`
  const type = offsets[key]?.[which]

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

export const refreshElements = (keys: string[], id: string) => {
  const elements = new Set<HTMLElement>()
  const key2element = new Map<string, HTMLElement>()
  const element2key = new Map<HTMLElement, string>()

  keys.forEach((key) => {
    const element = document.querySelector(
      `[data-menu-id='${getMenuId(id, key)}']`,
    ) as HTMLElement | null
    if (element) {
      elements.add(element)
      element2key.set(element, key)
      key2element.set(key, element)
    }
  })

  return { elements, key2element, element2key }
}

function getFocusElement(activeElement: HTMLElement, elements: Set<HTMLElement>) {
  let current: HTMLElement | null = activeElement
  while (current) {
    if (elements.has(current)) {
      return current
    }
    current = current.parentElement
  }
  return null
}

export function getFocusableElements(container: HTMLElement | null, elements: Set<HTMLElement>) {
  if (!container) {
    return []
  }
  const list = getFocusNodeList(container, true)
  return list.filter(ele => elements.has(ele))
}

function getNextFocusElement(
  parentQueryContainer: HTMLElement | null,
  elements: Set<HTMLElement>,
  focusMenuElement?: HTMLElement,
  offset: number = 1,
) {
  if (!parentQueryContainer) {
    return null
  }

  const sameLevelFocusableMenuElementList = getFocusableElements(parentQueryContainer, elements)
  const count = sameLevelFocusableMenuElementList.length

  if (!count) {
    return null
  }

  let focusIndex = sameLevelFocusableMenuElementList.indexOf(focusMenuElement as HTMLElement)
  if (focusIndex === -1) {
    focusIndex = offset > 0 ? 0 : count - 1
  }
  else {
    focusIndex = (focusIndex + offset + count) % count
  }

  return sameLevelFocusableMenuElementList[focusIndex]
}

export default function useAccessibility(
  mode: MenuMode,
  activeKey: { value: string | undefined },
  isRtl: boolean,
  id: string,
  containerRef: Ref<HTMLUListElement | null>,
  getKeys: () => string[],
  getKeyPath: (key: string, includeOverflow?: boolean) => string[],
  triggerActiveKey: (key: string | undefined) => void,
  triggerAccessibilityOpen: (key: string, open?: boolean) => void,
  originOnKeyDown?: (event: KeyboardEvent) => void,
) {
  const rafRef = { value: 0 }
  const activeRef = { value: activeKey.value }

  return (event: KeyboardEvent) => {
    activeRef.value = activeKey.value

    const { which } = event
    if (![...ArrowKeys, ENTER, ESC, HOME, END].includes(which)) {
      originOnKeyDown?.(event)
      return
    }

    const keys = getKeys()
    let refreshedElements = refreshElements(keys, id)
    const { elements, key2element, element2key } = refreshedElements

    const activeElement = activeRef.value ? key2element.get(activeRef.value) : null
    const container = containerRef.value
    const focusMenuElement = activeElement
      ? getFocusElement(activeElement, elements)
      : null
    const focusMenuKey = focusMenuElement ? element2key.get(focusMenuElement) : undefined

    const offsetObj = getOffset(
      mode,
      focusMenuKey ? getKeyPath(focusMenuKey, true).length === 1 : true,
      isRtl,
      which,
    )

    if (!offsetObj && which !== HOME && which !== END) {
      originOnKeyDown?.(event)
      return
    }

    if (ArrowKeys.includes(which) || [HOME, END].includes(which)) {
      event.preventDefault()
    }

    const tryFocus = (menuElement: HTMLElement | null) => {
      if (!menuElement) {
        return
      }

      const targetKey = element2key.get(menuElement)
      if (targetKey) {
        triggerActiveKey(targetKey)
      }

      raf.cancel(rafRef.value)
      rafRef.value = raf(() => {
        const link = menuElement.querySelector<HTMLAnchorElement>('a')
        const focusTargetElement = link?.getAttribute('href') ? link : menuElement
        focusTargetElement.focus()
      })
    }

    if ([HOME, END].includes(which) || offsetObj?.sibling || !focusMenuElement) {
      let parentQueryContainer: HTMLElement | null = container
      if (focusMenuElement && mode !== 'inline') {
        parentQueryContainer = findContainerUL(focusMenuElement)
      }

      let targetElement: HTMLElement | null = null
      const focusableElements = parentQueryContainer
        ? getFocusableElements(parentQueryContainer, elements)
        : []

      if (which === HOME) {
        targetElement = focusableElements[0] ?? null
      }
      else if (which === END) {
        targetElement = focusableElements[focusableElements.length - 1] ?? null
      }
      else {
        targetElement = getNextFocusElement(
          parentQueryContainer,
          elements,
          focusMenuElement ?? undefined,
          offsetObj?.offset,
        )
      }

      tryFocus(targetElement)
    }
    else if (offsetObj?.inlineTrigger) {
      if (focusMenuKey) {
        triggerAccessibilityOpen(focusMenuKey)
      }
    }
    else if ((offsetObj?.offset ?? 0) > 0) {
      if (focusMenuKey) {
        triggerAccessibilityOpen(focusMenuKey, true)
      }

      raf.cancel(rafRef.value)
      rafRef.value = raf(() => {
        refreshedElements = refreshElements(keys, id)
        const controlId = focusMenuElement?.getAttribute('aria-controls')
        const subQueryContainer = controlId
          ? document.getElementById(controlId)
          : null

        const targetElement = getNextFocusElement(
          subQueryContainer as HTMLElement,
          refreshedElements.elements,
        )
        tryFocus(targetElement)
      }, 5)
    }
    else if ((offsetObj?.offset ?? 0) < 0) {
      if (focusMenuKey) {
        const keyPath = getKeyPath(focusMenuKey, true)
        const parentKey = keyPath[keyPath.length - 2]
        if (parentKey) {
          const parentMenuElement = key2element.get(parentKey)
          triggerAccessibilityOpen(parentKey, false)
          tryFocus(parentMenuElement || null)
        }
      }
    }

    originOnKeyDown?.(event)
  }
}
