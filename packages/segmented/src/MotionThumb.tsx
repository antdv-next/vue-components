import type { CSSProperties, PropType, Ref, TransitionProps } from 'vue'
import type { SegmentedValue } from '.'
import { addClass, removeClass } from '@v-c/util/dist/Dom/class.ts'
import { anyType } from '@v-c/util/dist/type'
import classNames from 'classnames'
import { computed, defineComponent, onBeforeUnmount, ref, shallowRef, Transition, watch } from 'vue'

type ThumbRect = {
  left: number
  right: number
  width: number
  top: number
  bottom: number
  height: number
} | null

export interface MotionThumbInterface {
  containerRef: Ref<HTMLDivElement>
  value: SegmentedValue
  getValueIndex: (value: SegmentedValue) => number
  prefixCls: string
  motionName: string
  onMotionStart: VoidFunction
  onMotionEnd: VoidFunction
  direction?: 'ltr' | 'rtl'
  vertical?: boolean
}

function calcThumbStyle(targetElement: HTMLElement | null | undefined, vertical?: boolean): ThumbRect {
  if (!targetElement)
    return null

  const style: ThumbRect = {
    left: targetElement.offsetLeft,
    right: (targetElement.parentElement!.clientWidth as number) - targetElement.clientWidth - targetElement.offsetLeft,
    width: targetElement.clientWidth,
    top: targetElement.offsetTop,
    bottom: (targetElement.parentElement!.clientHeight as number) - targetElement.clientHeight - targetElement.offsetTop,
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

const MotionThumb = defineComponent({
  props: {
    value: anyType<SegmentedValue>(),
    getValueIndex: anyType<(value: SegmentedValue) => number>(),
    prefixCls: anyType<string>(),
    motionName: anyType<string>(),
    onMotionStart: anyType<VoidFunction>(),
    onMotionEnd: anyType<VoidFunction>(),
    direction: anyType<'ltr' | 'rtl'>(),
    containerRef: Object as PropType<Ref>,
    vertical: Boolean,
  },
  emits: ['motionStart', 'motionEnd'],
  setup(props, { emit }) {
    const thumbRef = shallowRef<HTMLDivElement>()

    // =========================== Effect ===========================
    const findValueElement = (val: SegmentedValue) => {
      const index = props.getValueIndex(val)
      const ele = props.containerRef!.value?.querySelectorAll(
        `.${props.prefixCls}-item`,
      )[index]

      return ele?.offsetParent && ele
    }

    const prevStyle = ref<ThumbRect>(null)
    const nextStyle = ref<ThumbRect>(null)

    watch(
      () => props.value,
      (value, prevValue) => {
        const { vertical = false } = props
        const prev = findValueElement(prevValue)
        const next = findValueElement(value)

        const calcPrevStyle = calcThumbStyle(prev, vertical)
        const calcNextStyle = calcThumbStyle(next, vertical)

        prevStyle.value = calcPrevStyle
        nextStyle.value = calcNextStyle

        if (prev && next) {
          emit('motionStart')
        }
        else {
          emit('motionEnd')
        }
      },
      { flush: 'post' },
    )

    const thumbStart = computed(() => {
      const { vertical = false, direction } = props
      if (vertical) {
        return toPX(prevStyle.value?.top ?? 0)
      }

      if (direction === 'rtl') {
        return toPX(-(prevStyle.value?.right as number))
      }

      return toPX(prevStyle.value?.left as number)
    })

    const thumbActive = computed(() => {
      const { vertical = false, direction } = props
      if (vertical) {
        return toPX(nextStyle.value?.top ?? 0)
      }

      if (direction === 'rtl') {
        return toPX(-(nextStyle.value?.right as number))
      }

      return toPX(nextStyle.value?.left as number)
    })

    // =========================== Motion ===========================
    let timeId: any
    const onAppearStart: TransitionProps['onBeforeEnter'] = (el: HTMLDivElement) => {
      const { vertical = false } = props
      clearTimeout(timeId)
      // // 使用nextTick会使反方向选择的动画表现错误，但是ant-design-vue中表现却正常，不确定原因先注释保留
      // nextTick(() => {
      //
      // })
      if (el) {
        if (vertical) {
          el.style.transform = `translateY(var(--thumb-start-top))`
          el.style.height = `var(--thumb-start-height)`
        }
        else {
          el.style.transform = `translateX(var(--thumb-start-left))`
          el.style.width = `var(--thumb-start-width)`
        }
      }
    }

    const onAppearActive: TransitionProps['onEnter'] = (el: HTMLDivElement) => {
      const { vertical = false, motionName } = props
      timeId = setTimeout(() => {
        if (el) {
          if (vertical) {
            el.style.transform = `translateY(var(--thumb-active-top))`
            el.style.height = `var(--thumb-active-height)`
          }
          else {
            addClass(el, `${motionName}-appear-active`)
            el.style.transform = `translateX(var(--thumb-active-left))`
            el.style.width = `var(--thumb-active-width)`
          }
        }
      })
    }

    const onAppearEnd: TransitionProps['onAfterEnter'] = (el: HTMLDivElement) => {
      prevStyle.value = null
      nextStyle.value = null
      if (el) {
        el.style.transform = ''
        el.style.width = ''
        el.style.transition = 'none'
        el.style.height = ''
        el.style.left = ''
        el.style.top = ''
        el.style.right = ''
        removeClass(el, `${props.motionName}-appear-active`)
      }
      emit('motionEnd')
    }

    onBeforeUnmount(() => {
      clearTimeout(timeId)
    })
    return () => {
      // =========================== Render ===========================
      // No need motion when nothing exist in queue
      if (!prevStyle.value || !nextStyle.value) {
        return null
      }

      const {
        prefixCls,
      } = props

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

      // It's little ugly which should be refactor when @umi/test update to latest jsdom
      const motionProps = {
        ref: thumbRef,
        style: mergedStyle,
        class: classNames(`${prefixCls}-thumb`),
      }

      return (
        <Transition
          appear
          onBeforeEnter={onAppearStart}
          onEnter={onAppearActive}
          onAfterEnter={onAppearEnd}
        >
          <div {...motionProps}></div>
        </Transition>
      )
    }
  },
})

export default MotionThumb
