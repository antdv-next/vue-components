import type { CSSProperties } from 'vue'
import type { SegmentedValue } from './index.tsx'
import { clsx } from '@v-c/util'
import { getTransitionProps } from '@v-c/util/dist/utils/transition.ts'
import { computed, defineComponent, onBeforeUnmount, shallowRef, Transition, watch } from 'vue'

type ThumbReact = {
  left: number
  right: number
  width: number
  top: number
  bottom: number
  height: number
} | null

export interface MotionThumbInterface {
  containerRef: HTMLDivElement
  value: SegmentedValue
  getValueIndex: (value: SegmentedValue) => number
  prefixCls: string
  motionName: string
  onMotionStart: VoidFunction
  onMotionEnd: VoidFunction
  direction?: 'ltr' | 'rtl'
  vertical?: boolean
}

function calcThumbStyle(targetElement: HTMLElement | null | undefined, vertical?: boolean): ThumbReact {
  if (!targetElement)
    return null

  const style: ThumbReact = {
    left: targetElement.offsetLeft,
    right:
            (targetElement.parentElement!.clientWidth as number)
            - targetElement.clientWidth
            - targetElement.offsetLeft,
    width: targetElement.clientWidth,
    top: targetElement.offsetTop,
    bottom:
            (targetElement.parentElement!.clientHeight as number)
            - targetElement.clientHeight
            - targetElement.offsetTop,
    height: targetElement.clientHeight,
  }

  if (vertical) {
    // Adjusts positioning and size for vertical layout by setting horizontal properties to 0 and using vertical properties from the style object.
    return {
      left: 0,
      right: 0,
      width: 0,
      top: style.top,
      bottom: style.bottom,
      height: style.height,
    }
  }

  return {
    left: style.left,
    right: style.right,
    width: style.width,
    top: 0,
    bottom: 0,
    height: 0,
  }
}

function toPX(value: number | undefined): string | undefined {
  return value !== undefined ? `${value}px` : undefined
}

const defaults = {
  vertical: false,
} as any
const MotionThumb = defineComponent<MotionThumbInterface>(
  (props = defaults) => {
    const thumbRef = shallowRef<HTMLDivElement>()
    const preValue = shallowRef(props.value)
    // =========================== Effect ===========================
    const findValueElement = (val: SegmentedValue) => {
      const getValueIndex = props.getValueIndex
      const containerRef = props.containerRef
      const prefixCls = props.prefixCls
      const index = getValueIndex(val)
      const ele = containerRef?.querySelectorAll<HTMLDivElement>(
        `.${prefixCls}-item`,
      )[index]
      return ele?.offsetParent && ele
    }

    const prevStyle = shallowRef<ThumbReact>(null)
    const nextStyle = shallowRef<ThumbReact>(null)
    let asyncId: ReturnType<typeof setTimeout> | null = null
    const clearAsync = () => {
      if (asyncId) {
        clearTimeout(asyncId)
        asyncId = null
      }
    }
    watch(
      () => props.value,
      () => {
        if (preValue.value !== props.value) {
          const prev = findValueElement(preValue.value)
          const next = findValueElement(props.value)

          const calcPrevStyle = calcThumbStyle(prev, props.vertical)
          const calcNextStyle = calcThumbStyle(next, props.vertical)
          preValue.value = props.value
          prevStyle.value = calcPrevStyle
          nextStyle.value = calcNextStyle
          if (prev && next) {
            props.onMotionStart?.()
          }
          else {
            props?.onMotionEnd?.()
          }
        }
      },
      {
        immediate: true,
        flush: 'post',
      },
    )

    const thumbStart = computed(() => {
      if (props.vertical) {
        return toPX(prevStyle.value?.top ?? 0)
      }
      if (props.direction === 'rtl') {
        return toPX(-(prevStyle.value?.right as number))
      }
      return toPX(prevStyle.value?.left as number)
    })

    const thumbActive = computed(() => {
      if (props.vertical) {
        return toPX(nextStyle.value?.top ?? 0)
      }
      if (props.direction === 'rtl') {
        return toPX(-(nextStyle.value?.right as number))
      }
      return toPX(nextStyle.value?.left as number)
    })

    // =========================== Motion ===========================
    const onAppearStart = (_el: Element) => {
      clearAsync()
      const el = _el as HTMLElement
      if (props.vertical) {
        el.style.transform = 'translateY(var(--thumb-start-top))'
        el.style.height = 'var(--thumb-start-height)'
        return
      }
      el.style.transform = 'translateX(var(--thumb-start-left))'
      el.style.width = 'var(--thumb-start-width)'
    }

    const onAppearActive = (_el: Element) => {
      const el = _el as HTMLElement
      clearAsync()
      asyncId = setTimeout(() => {
        if (props.vertical) {
          el.style.transform = 'translateY(var(--thumb-active-top))'
          el.style.height = 'var(--thumb-active-height)'
          return
        }
        el.style.transform = 'translateX(var(--thumb-active-left))'
        el.style.width = 'var(--thumb-active-width)'
      })
    }

    const onVisibleChanged = () => {
      clearAsync()
      prevStyle.value = null
      nextStyle.value = null
      props?.onMotionEnd?.()
    }
    onBeforeUnmount(() => {
      clearAsync()
    })
    return () => {
      const { prefixCls } = props
      // =========================== Render ===========================
      // No need motion when nothing exist in queue
      if (!prevStyle.value || !nextStyle.value) {
        return null
      }
      const transitionProps = getTransitionProps(props?.motionName, {
        onBeforeAppear: onAppearStart,
        onAppear: onAppearActive,
        onBeforeEnter: onAppearStart,
        onEnter: onAppearActive,
        onAfterEnter: () => onVisibleChanged(),
        onAfterAppear: () => onVisibleChanged(),
      })
      const visible = true
      const mergedStyle = {
        '--thumb-start-left': thumbStart.value,
        '--thumb-start-width': toPX(prevStyle.value?.width),
        '--thumb-active-left': thumbActive.value,
        '--thumb-active-width': toPX(nextStyle.value?.width),
        '--thumb-start-top': thumbStart.value,
        '--thumb-start-height': toPX(prevStyle.value?.height),
        '--thumb-active-top': thumbActive.value,
        '--thumb-active-height': toPX(nextStyle.value?.height),
      } as CSSProperties
      return (
        <Transition {...transitionProps}>
          {visible ? <div ref={thumbRef} style={mergedStyle} class={clsx(`${prefixCls}-thumb`)} /> : null}
        </Transition>
      )
    }
  },
)

export default MotionThumb
