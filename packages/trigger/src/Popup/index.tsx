import type { CSSProperties, PropType, SlotsType, TransitionProps } from 'vue'
import type { AlignType, ArrowPos, ArrowTypeOuter } from '../interface'
import Portal from '@v-c/portal'
import ResizeObserver from '@v-c/resize-observer'
import { classNames } from '@v-c/util'
import { flattenChildren } from '@v-c/util/dist/props-util'
import { defineComponent, ref, Transition, watch, watchEffect } from 'vue'
import { useInjectTriggerContext } from '../context.ts'
import { Arrow } from './Arrow'
import Mask from './Mask'

const popupProps = {
  prefixCls: String,
  className: String,
  target: { type: Object as PropType<HTMLElement | null> },
  onMouseEnter: Function,
  onMouseLeave: Function,
  onPointerEnter: Function,
  onPointerDownCapture: Function,
  zIndex: Number,

  mask: Boolean,
  onVisibleChanged: Function,

  // Arrow
  align: { type: Object as PropType<AlignType> },
  arrow: { type: Object as PropType<ArrowTypeOuter | null> },
  arrowPos: { type: Object as PropType<ArrowPos> },

  // Open
  open: Boolean,
  /** Tell Portal that should keep in screen. e.g. should wait all motion end */
  keepDom: Boolean,
  fresh: Boolean,

  // Click
  onClick: Function,

  // Motion
  motion: Object,
  maskMotion: Object,

  // Portal
  forceRender: Boolean,
  getPopupContainer: {
    type: Function as PropType<(target?: HTMLElement) => HTMLElement>,
  },
  autoDestroy: Boolean,
  portal: Object,

  // Align
  ready: Boolean,
  offsetX: Number,
  offsetY: Number,
  offsetR: Number,
  offsetB: Number,
  onAlign: Function,
  onPrepare: Function,

  // stretch
  stretch: String,
  targetWidth: Number,
  targetHeight: Number,
}

function getTransitionProps(transitionName: string, opt: TransitionProps = {}) {
  const transitionProps: TransitionProps = transitionName
    ? {
        name: transitionName,
        appear: true,
        // type: 'animation',
        // appearFromClass: `${transitionName}-appear ${transitionName}-appear-prepare`,
        // appearActiveClass: `antdv-base-transtion`,
        // appearToClass: `${transitionName}-appear ${transitionName}-appear-active`,
        enterFromClass: `${transitionName}-enter ${transitionName}-enter-prepare ${transitionName}-enter-start`,
        enterActiveClass: `${transitionName}-enter ${transitionName}-enter-prepare`,
        enterToClass: `${transitionName}-enter ${transitionName}-enter-active`,
        leaveFromClass: ` ${transitionName}-leave`,
        leaveActiveClass: `${transitionName}-leave ${transitionName}-leave-active`,
        leaveToClass: `${transitionName}-leave ${transitionName}-leave-active`,
        ...opt,
      }
    : { css: false, ...opt }
  return transitionProps
}

export const Popup = defineComponent({
  name: 'Popup',
  props: { ...popupProps },
  slots: Object as SlotsType<{
    default: any
    popup: any
  }>,
  emits: ['mouseEnter', 'mouseLeave', 'pointerEnter', 'click', 'prepare', 'getElement', 'pointerDownCapture', 'align', 'visibleChanged'],
  setup(props, { attrs, emit, slots, expose }) {
    const popupRef = ref()
    // ======================= Container ========================
    const getPopupContainerNeedParams = ref(props.getPopupContainer && props.getPopupContainer?.length > 0)

    const show = ref(
      !props.getPopupContainer || !getPopupContainerNeedParams.value,
    )

    // Delay to show since `getPopupContainer` need target element
    watchEffect(() => {
      if (!show.value && getPopupContainerNeedParams.value && props.target) {
        show.value = true
      }
    })
    watch([show, () => props.target, getPopupContainerNeedParams], () => {
      if (!show.value && getPopupContainerNeedParams.value && props.target) {
        show.value = true
      }
    })

    // >>>>> Offset
    const AUTO = 'auto' as const

    const offsetStyle: CSSProperties = {
      left: '-1000vw',
      top: '-1000vh',
      right: AUTO,
      bottom: AUTO,
    }
    watch(popupRef, () => {
      emit('getElement', popupRef.value)
    })
    const onPrepare = () => {
      emit('prepare')
      emit('visibleChanged', (props.forceRender || props.open || props.keepDom))
    }
    const onResize = () => {
      emit('align')
    }
    const onEmitEvent = (name: any, ...args: unknown[]) => {
      emit(name, ...args)
    }

    const data = useInjectTriggerContext()
    expose({
      registerSubPopup: (id: string, node: HTMLElement) => {
        data?.registerSubPopup(id, node)
      },
    })
    return () => {
      const {
        mask,
        open,
        keepDom,
        // Arrow
        arrow,
        arrowPos,
        align,
        prefixCls = 'vc-trigger-popup',
        target,
        // fresh,
        // Motion
        motion,
        maskMotion,
        // Portal
        forceRender,
        getPopupContainer,
        autoDestroy,
        // portal: Portal,
        zIndex,
        ready,
        offsetX,
        offsetY,
        offsetR,
        offsetB,
        stretch,
        targetWidth,
        targetHeight,
      } = props
      const childNode = flattenChildren(slots.default?.())
      // We can not remove holder only when motion finished.
      const isNodeVisible = open || keepDom

      const cls = classNames(prefixCls, [attrs.class], { [`${prefixCls}-hidden`]: !isNodeVisible })
      // ========================= Render =========================
      if (!show.value) {
        return null
      }
      // Set align style
      if (ready || !open) {
        const { points } = align || { points: [] } as any
        const dynamicInset
            = align?.dynamicInset || (align as any)._experimental?.dynamicInset
        const alignRight = dynamicInset && points[0][1] === 'r'
        const alignBottom = dynamicInset && points[0][0] === 'b'

        if (alignRight) {
          offsetStyle.right = `${offsetR}px`
          offsetStyle.left = AUTO
        }
        else {
          offsetStyle.left = `${offsetX}px`
          offsetStyle.right = AUTO
        }

        if (alignBottom) {
          offsetStyle.bottom = `${offsetB}px`
          offsetStyle.top = AUTO
        }
        else {
          offsetStyle.top = `${offsetY}px`
          offsetStyle.bottom = AUTO
        }
      }

      // >>>>> Misc
      const miscStyle: CSSProperties = {}
      if (stretch) {
        if (stretch.includes('height') && targetHeight) {
          miscStyle.height = `${targetHeight}px`
        }
        else if (stretch.includes('minHeight') && targetHeight) {
          miscStyle.minHeight = `${targetHeight}px`
        }
        if (stretch.includes('width') && targetWidth) {
          miscStyle.width = `${targetWidth}px`
        }
        else if (stretch.includes('minWidth') && targetWidth) {
          miscStyle.minWidth = `${targetWidth}px`
        }
      }

      if (!open) {
        miscStyle.pointerEvents = 'none'
      }

      const transitionProps = getTransitionProps(motion?.name, motion)
      return (
        <Portal
          open={forceRender || isNodeVisible}
          getContainer={getPopupContainer && (() => getPopupContainer(target!))}
          autoDestroy={autoDestroy}
        >
          <Mask
            prefixCls={prefixCls}
            open={open}
            zIndex={zIndex}
            mask={mask}
            motion={maskMotion}
          />
          <ResizeObserver onResize={onResize} disabled={!open}>
            <Transition onBeforeEnter={onPrepare} onBeforeAppear={onPrepare} {...transitionProps} appear>
              <div
                v-show={forceRender || isNodeVisible}
                ref={popupRef}
                class={cls}
                style={
                  {
                    '--arrow-x': `${arrowPos?.x || 0}px`,
                    '--arrow-y': `${arrowPos?.y || 0}px`,
                    ...offsetStyle,
                    ...miscStyle,
                    'boxSizing': 'border-box',
                    zIndex,
                    ...attrs.style as CSSProperties,
                  } as CSSProperties
                }
                onMouseenter={e => onEmitEvent('mouseEnter', e)}
                onMouseleave={e => onEmitEvent('mouseLeave', e)}
                onPointerenter={e => onEmitEvent('pointerEnter', e)}
                onClick={e => onEmitEvent('click', e)}
                onPointerdown={e => onEmitEvent('pointerDownCapture', e)}
              >
                {arrow && (
                  <Arrow
                    prefixCls={prefixCls}
                    arrow={arrow}
                    arrowPos={arrowPos!}
                    align={align!}
                  />
                )}
                {childNode}
              </div>
            </Transition>
          </ResizeObserver>
        </Portal>
      )
    }
  },
})
