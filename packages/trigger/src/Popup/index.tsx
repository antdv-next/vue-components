import type { ResizeObserverProps } from '@v-c/resize-observer'
import type { CSSMotionProps } from '@v-c/util/dist/utils/transition'
import type { CSSProperties } from 'vue'
import type { TriggerProps } from '../index.tsx'
import type { AlignType, ArrowPos, ArrowTypeOuter } from '../interface.ts'
import ResizeObserver from '@v-c/resize-observer'
import { classNames } from '@v-c/util'
import { toPropsRefs } from '@v-c/util/dist/props-util'
import { getTransitionProps } from '@v-c/util/dist/utils/transition'
import { computed, defineComponent, nextTick, shallowRef, Transition, watchEffect } from 'vue'
import useOffsetStyle from '../hooks/useOffsetStyle.ts'
import { Arrow } from './Arrow.tsx'
import Mask from './Mask.tsx'
import PopupContent from './PopupContent.tsx'

export interface MobileConfig {
  mask?: boolean
  /** Set popup motion. You can ref `rc-motion` for more info. */
  motion?: CSSMotionProps
  /** Set mask motion. You can ref `rc-motion` for more info. */
  maskMotion?: CSSMotionProps
}

export interface PopupProps {
  prefixCls: string
  className?: string
  style?: CSSProperties
  popup?: TriggerProps['popup']
  target: HTMLElement
  onMouseEnter?: (e: MouseEvent) => void
  onMouseLeave?: (e: MouseEvent) => void
  onPointerEnter?: (e: PointerEvent) => void
  onPointerDownCapture?: (e: PointerEvent) => void
  zIndex?: number

  mask?: boolean
  onVisibleChanged: (visible: boolean) => void

  // Arrow
  align?: AlignType
  arrow?: ArrowTypeOuter
  arrowPos: ArrowPos

  // Open
  open: boolean
  /** Tell Portal that should keep in screen. e.g. should wait all motion end */
  keepDom: boolean
  fresh?: boolean

  // Click
  onClick?: (e: MouseEvent) => void

  // Motion
  motion?: CSSMotionProps
  maskMotion?: CSSMotionProps

  // Portal
  forceRender?: boolean
  getPopupContainer?: TriggerProps['getPopupContainer']
  autoDestroy?: boolean
  portal: any

  // children?: React.ReactElement

  // Align
  ready: boolean
  offsetX: number
  offsetY: number
  offsetR: number
  offsetB: number
  onAlign: VoidFunction
  onPrepare: () => Promise<void>

  // stretch
  stretch?: string
  targetWidth?: number
  targetHeight?: number

  // Resize
  onResize?: ResizeObserverProps['onResize']

  // Mobile
  mobile?: MobileConfig
}

const defaults = {
  autoDestroy: true,
} as any

const Popup = defineComponent<PopupProps>(
  (props = defaults, { attrs, expose }) => {
    const popupContent = computed(
      () => typeof props.popup === 'function' ? (props as any).popup() : props.popup,
    )

    const {
      offsetX,
      offsetR,
      offsetY,
      offsetB,
      open,
      ready,
      align,
    } = toPropsRefs(
      props,
      'offsetX',
      'offsetB',
      'offsetY',
      'offsetR',
      'ready',
      'open',
      'align',
    )
    // We can not remove holder only when motion finished.
    const isNodeVisible = computed(() => props.open || props.keepDom)

    // ========================= Mobile =========================
    const isMobile = computed(() => !!props.mobile)

    // ======================= Container ========================
    const getPopupContainerNeedParams = (props as any)?.getPopupContainer?.length > 0

    const mergedProps = computed(() => {
      const { mobile, mask, maskMotion, motion } = props
      if (mobile) {
        return [mobile.mask, mobile.maskMotion, mobile.motion] as const
      }

      return [mask, maskMotion, motion] as const
    })

    const show = shallowRef(!props.getPopupContainer || !getPopupContainerNeedParams)

    // Delay to show since `getPopupContainer` need target element
    watchEffect(async () => {
      await nextTick()
      const getPopupContainerNeedParams = (props as any)?.getPopupContainer?.length > 0
      const target = props.target
      if (!show.value && getPopupContainerNeedParams && target) {
        show.value = true
      }
    })

    // ========================= Resize =========================
    const onInternalResize: ResizeObserverProps['onResize'] = (size, element) => {
      props?.onResize?.(size, element)
      props?.onAlign?.()
    }

    // ========================= Styles =========================
    const offsetStyle = useOffsetStyle(
      isMobile,
      ready,
      open,
      align,
      offsetR,
      offsetB,
      offsetX,
      offsetY,
    )
    const popupElementRef = shallowRef<HTMLDivElement>()
    expose({
      getElement: () => popupElementRef.value,
      nativeElement: popupElementRef,
    })
    return () => {
      // ========================= Render =========================
      if (!show.value) {
        return null
      }
      const {
        stretch,
        targetHeight,
        targetWidth,
        portal: Portal,
        forceRender,
        getPopupContainer,
        target,
        autoDestroy,
        zIndex,
        prefixCls,

        // Arrow
        arrow,
        arrowPos,
        align,

        onMouseEnter,
        onMouseLeave,
        onPointerEnter,
        onPointerDownCapture,
        onClick,
        fresh,

        onPrepare,
        onVisibleChanged,
      } = props

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
      if (!open.value) {
        miscStyle.pointerEvents = 'none'
      }
      const [mergedMask, mergedMaskMotion, mergedPopupMotion] = mergedProps.value
      const popupMotionName = (mergedPopupMotion as any)?.name ?? (mergedPopupMotion as any)?.motionName
      const baseTransitionProps: any = getTransitionProps(popupMotionName, mergedPopupMotion)
      const mergedTransitionProps = {
        ...baseTransitionProps,
        onBeforeAppear: (element: Element) => {
          onPrepare?.()
          baseTransitionProps?.onBeforeAppear?.(element)
        },
        onBeforeEnter: (element: Element) => {
          onPrepare?.()
          baseTransitionProps?.onBeforeEnter?.(element)
        },
        onAfterAppear: (element: Element) => {
          baseTransitionProps?.onAfterAppear?.(element)
          onVisibleChanged?.(true)
        },
        onAfterEnter: (element: Element) => {
          baseTransitionProps?.onAfterEnter?.(element)
          onVisibleChanged?.(true)
        },
        onAfterLeave: (element: Element) => {
          baseTransitionProps.onAfterLeave?.(element)
          onVisibleChanged?.(false)
        },
      }
      const cls = classNames(
        prefixCls,
        (attrs as any).class,
        {
          [`${prefixCls}-mobile`]: isMobile.value,
        },
      )
      return (
        <Portal
          open={forceRender || isNodeVisible.value}
          getContainer={!!getPopupContainer && (() => getPopupContainer!(target))}
          autoDestroy={autoDestroy}
        >
          <Mask
            prefixCls={prefixCls}
            open={open.value}
            zIndex={zIndex}
            mask={mergedMask!}
            motion={mergedMaskMotion!}
            mobile={isMobile.value!}
          />
          <ResizeObserver
            onResize={onInternalResize}
            disabled={!open.value}
          >
            <Transition
              {...mergedTransitionProps}
            >
              { (isNodeVisible.value || open.value) && (
                <div
                  ref={popupElementRef}
                  v-show={open.value}
                  class={cls}
                  style={[
                    {
                      '--arrow-x': `${arrowPos.x || 0}px`,
                      '--arrow-y': `${arrowPos.y || 0}px`,
                    },
                    offsetStyle.value,
                    miscStyle,
                    {
                      boxSizing: 'border-box',
                      zIndex,
                    },
                    props.style,
                  ]}
                  onMouseenter={onMouseEnter}
                  onMouseleave={onMouseLeave}
                  onPointerenter={onPointerEnter}
                  onClick={onClick}
                  {
                    ...{
                      onPointerdownCapture: onPointerDownCapture,
                    }
                  }
                >
                  {arrow && (
                    <Arrow
                      prefixCls={prefixCls}
                      arrow={arrow}
                      arrowPos={arrowPos}
                      align={align!}
                    />
                  )}

                  <PopupContent cache={!open.value && !fresh}>
                    {popupContent.value}
                  </PopupContent>
                </div>
              )}
            </Transition>
          </ResizeObserver>
        </Portal>
      )
    }
  },
)

export default Popup
