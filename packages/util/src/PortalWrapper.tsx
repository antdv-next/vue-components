import type { SlotsType } from 'vue'
import type { PortalRef } from './Portal'
import { defineComponent, onBeforeUnmount, onMounted, onUpdated, shallowRef } from 'vue'
import canUseDom from './Dom/canUseDom'
import ScrollLocker from './Dom/scrollLocker'
import Portal from './Portal'
import raf from './raf'
import setStyle from './setStyle'

// import raf from './raf';

let openCount = 0
const supportDom = canUseDom()

/**
 * @private
 */
export function getOpenCount() {
  return process.env.NODE_ENV === 'test' ? openCount : 0
}

// https://github.com/ant-design/ant-design/issues/19340
// https://github.com/ant-design/ant-design/issues/19332
let cacheOverflow = {}

function getParent(getContainer: GetContainer) {
  if (!supportDom)
    return null

  if (getContainer) {
    if (typeof getContainer === 'string')
      return document.querySelectorAll(getContainer)[0]

    if (typeof getContainer === 'function')
      return getContainer()

    if (
      typeof getContainer === 'object'
      && getContainer instanceof window.HTMLElement
    ) {
      return getContainer
    }
  }
  return document.body
}

export type GetContainer = string | HTMLElement | (() => HTMLElement)

export type DefaultSlotInfo = SlotsType<{
  default: {
    getOpenCount: () => number
    getContainer: () => HTMLElement
    switchScrollingEffect: () => void
    scrollLocker: ScrollLocker
  }
}>

export interface PortalWrapperProps {
  visible?: boolean
  getContainer?: GetContainer
  wrapperClassName?: string
  forceRender?: boolean
}
interface PortalWrapperEmits {
  [key: string]: any
}

const PortalWrapper = defineComponent<PortalWrapperProps, PortalWrapperEmits, string, DefaultSlotInfo>((props, ctx) => {
  const container = shallowRef<HTMLElement>()
  const componentRef = shallowRef<PortalRef>()
  const rafId = shallowRef<number>()
  const scrollLocker = shallowRef<ScrollLocker>()

  const removeCurrentContainer = () => {
    // Portal will remove from `parentNode`.
    // Let's handle this again to avoid refactor issue.
    container.value?.parentNode?.removeChild(container.value)
  }

  const updateOpenCount = (prevProps?: Partial<PortalWrapperProps>) => {
    const { visible: prevVisible, getContainer: prevGetContainer }
      = prevProps || {}
    const { visible, getContainer } = props

    // Update count
    if (
      visible !== prevVisible
      && supportDom
      && getParent(getContainer!) === document.body
    ) {
      if (visible && !prevVisible)
        openCount += 1
      else if (prevProps)
        openCount -= 1
    }

    // Clean up container if needed
    const getContainerIsFunc
      = typeof getContainer === 'function'
        && typeof prevGetContainer === 'function'
    if (
      getContainerIsFunc
        ? getContainer.toString() !== prevGetContainer.toString()
        : getContainer !== prevGetContainer
    ) {
      removeCurrentContainer()
    }
  }

  const attachToParent = (force = false) => {
    if (force || (container.value && !container.value.parentNode)) {
      const parent = getParent(props.getContainer!)
      if (parent) {
        parent.appendChild(container.value!)
        return true
      }

      return false
    }

    return true
  }
  const setWrapperClassName = () => {
    const { wrapperClassName } = props
    if (
      container.value
      && wrapperClassName
      && wrapperClassName !== container.value.className
    ) {
      container.value.className = wrapperClassName
    }
  }

  const getContainer = () => {
    if (!supportDom)
      return null

    if (!container.value) {
      container.value = document.createElement('div')
      attachToParent(true)
    }
    setWrapperClassName()
    return container.value
  }

  onMounted(() => {
    scrollLocker.value = new ScrollLocker({
      container: getParent(props.getContainer!) as HTMLElement,
    })
    updateOpenCount()
    if (!attachToParent()) {
      rafId.value = raf(() => {
        // 对组件执行强制更新 forceUpdate,准备采用改变key的方式来实现
      })
    }
  })

  onUpdated(() => {
    updateOpenCount(props)
    updateOpenCount(props)
    setWrapperClassName()
    attachToParent()
  })

  onBeforeUnmount(() => {
    const { visible, getContainer } = props
    if (supportDom && getParent(getContainer!) === document.body) {
      // 离开时不会 render， 导到离开时数值不变，改用 func 。。
      openCount = visible && openCount ? openCount - 1 : openCount
    }
    removeCurrentContainer()
    raf.cancel(rafId.value!)
  })

  /**
   * Enhance ./switchScrollingEffect
   * 1. Simulate document body scroll bar with
   * 2. Record body has overflow style and recover when all of PortalWrapper invisible
   * 3. Disable body scroll when PortalWrapper has open
   *
   * @memberof PortalWrapper
   */
  const switchScrollingEffect = () => {
    if (openCount === 1 && !Object.keys(cacheOverflow).length) {
      switchScrollingEffect()
      // Must be set after switchScrollingEffect
      cacheOverflow = setStyle({
        overflow: 'hidden',
        overflowX: 'hidden',
        overflowY: 'hidden',
      })
    }
    else if (!openCount) {
      setStyle(cacheOverflow)
      cacheOverflow = {}
      switchScrollingEffect()
    }
  }
  return () => {
    const { forceRender, visible } = props
    let portal = null
    const childProps = {
      getOpenCount,
      getContainer,
      switchScrollingEffect,
      scrollLocker: scrollLocker.value,
    }
    if (forceRender || visible || componentRef.value) {
      portal = (
        <Portal getContainer={getContainer as any} ref={componentRef}>
          {ctx?.slots?.default(childProps as any)}
        </Portal>
      )
    }
    return portal
  }
  // TODO
})

export default PortalWrapper
