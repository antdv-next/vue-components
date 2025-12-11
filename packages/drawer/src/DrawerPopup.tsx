import type { CSSMotionProps } from '@v-c/util/dist/utils/transition'
import type { CSSProperties } from 'vue'
import type { DrawerPanelEvents } from './DrawerPanel'
import type { DrawerClassNames, DrawerStyles } from './inter'
import { clsx } from '@v-c/util'
import { KeyCodeStr } from '@v-c/util/dist/KeyCode'
import pickAttrs from '@v-c/util/dist/pickAttrs'
import { getAttrStyleAndClass, toPropsRefs } from '@v-c/util/dist/props-util'
import { getTransitionProps } from '@v-c/util/dist/utils/transition'
import { computed, defineComponent, nextTick, onBeforeUnmount, shallowRef, Transition, watch } from 'vue'
import { useDrawerContext, useDrawerProvide } from './context'
import DrawerPanel from './DrawerPanel'
import useDrag from './hooks/useDrag.ts'
import { parseWidthHeight } from './util'

const sentinelStyle: CSSProperties = {
  width: 0,
  height: 0,
  overflow: 'hidden',
  outline: 'none',
  position: 'absolute',
}

export type Placement = 'left' | 'right' | 'top' | 'bottom'

export interface PushConfig {
  distance?: number | string
}

// export type DrawerPopupProps = Partial<ExtractPropTypes<ReturnType<typeof drawerPopupProps>>>
export interface DrawerPopupProps extends DrawerPanelEvents {
  prefixCls: string
  open?: boolean
  inline?: boolean
  push?: boolean | PushConfig
  forceRender?: boolean
  autoFocus?: boolean
  keyboard?: boolean

  // Root
  rootClassName?: string
  rootStyle?: CSSProperties
  zIndex?: number

  // Drawer
  placement?: Placement
  id?: string

  width?: number | string
  height?: number | string
  /** Size of the drawer (width for left/right placement, height for top/bottom placement) */
  size?: number | string
  /** Maximum size of the drawer */
  maxSize?: number

  // Mask
  mask?: boolean
  maskClosable?: boolean
  maskClassName?: string
  maskStyle?: CSSProperties

  motion?: CSSMotionProps | ((placement: Placement | undefined) => CSSMotionProps)
  maskMotion?: CSSMotionProps

  // Events
  afterOpenChange?: (open: boolean) => void
  onClose?: (e: MouseEvent | KeyboardEvent) => void

  // classNames
  classNames?: DrawerClassNames

  // styles
  styles?: DrawerStyles
  drawerRender?: (node: any) => any

  // resizable
  /** Default size for uncontrolled resizable drawer */
  defaultSize?: number | string
  resizable?:
    | boolean
    | {
      onResize?: (size: number) => void
      onResizeStart?: () => void
      onResizeEnd?: () => void
    }

}

const DrawerPopup = defineComponent<DrawerPopupProps>(
  (props, { expose, attrs, slots }) => {
    // ================================ Refs ================================
    const panelRef = shallowRef<HTMLDivElement>()
    const sentinelStartRef = shallowRef<HTMLDivElement>()
    const sentinelEndRef = shallowRef<HTMLDivElement>()

    const {
      open,
      autoFocus,
      placement,
      push,
      maxSize,
    } = toPropsRefs(
      props,
      'open',
      'autoFocus',
      'push',
      'placement',
      'maxSize',
    )

    expose({
      panelRef,
    })

    const onPanelKeyDown = (e: KeyboardEvent) => {
      const { onClose, keyboard } = props
      const { key, shiftKey } = e
      switch (key) {
        case KeyCodeStr.Tab:{
          if (key === KeyCodeStr.Tab) {
            if (!shiftKey && document.activeElement === sentinelEndRef.value) {
              sentinelStartRef.value?.focus({ preventScroll: true })
            }
            else if (shiftKey && document.activeElement === sentinelStartRef.value) {
              sentinelEndRef.value?.focus({ preventScroll: true })
            }
          }
          break
        }

        // Close
        case KeyCodeStr.Escape:{
          if (onClose && keyboard) {
            e.stopPropagation()
            onClose(e)
          }
        }
      }
    }

    // ========================== Control ===========================
    // Auto Focus
    watch([open], async () => {
      await nextTick()
      if (open.value && autoFocus.value) {
        panelRef.value?.focus?.({ preventScroll: true })
      }
    }, {
      immediate: true,
      flush: 'post',
    })

    // ============================ Push ============================
    const pushed = shallowRef(false)

    const parentContext = useDrawerContext()

    // Merge push distance
    const pushConfig = computed(() => {
      if (typeof push.value === 'boolean') {
        return push.value ? {} : { distance: 0 }
      }
      else {
        return push.value || {}
      }
    })

    const pushDistance = computed(() => pushConfig.value?.distance ?? parentContext.value?.pushDistance ?? 180)
    const mergedContext = computed(() => {
      return {
        pushDistance: pushDistance.value,
        push: () => {
          pushed.value = true
        },
        pull: () => {
          pushed.value = false
        },
      }
    })
    useDrawerProvide(mergedContext)

    // ========================= ScrollLock =========================
    // Tell parent to push
    watch(open, () => {
      if (open.value) {
        parentContext?.value?.push?.()
      }
      else {
        parentContext.value?.pull?.()
      }
    }, {
      immediate: true,
    })

    onBeforeUnmount(() => {
      parentContext.value?.pull?.()
    })

    // ============================ Size ============================
    const currentSize = shallowRef<number>()

    const isHorizontal = computed(() => placement.value === 'left' || placement.value === 'right')

    // Aggregate size logic with backward compatibility using useMemo
    const mergedSize = computed(() => {
      const legacySize = isHorizontal.value ? props.width : props.height
      const nextMergedSize = props?.size ?? legacySize ?? currentSize.value ?? props?.defaultSize ?? (isHorizontal.value ? 378 : undefined)
      return parseWidthHeight(nextMergedSize)
    })

    // >>> Style
    const wrapperStyle = computed<CSSProperties>(() => {
      const nextWrapperStyle: CSSProperties = {}
      if (pushed.value && pushDistance.value) {
        switch (placement.value) {
          case 'top':
            nextWrapperStyle.transform = `translateY(${pushDistance.value}px)`
            break
          case 'bottom':
            nextWrapperStyle.transform = `translateY(${-pushDistance.value}px)`
            break
          case 'left':
            nextWrapperStyle.transform = `translateX(${pushDistance.value}px)`
            break
          default:
            nextWrapperStyle.transform = `translateX(${-pushDistance.value}px)`
            break
        }
      }
      if (isHorizontal.value) {
        const parseWidth = parseWidthHeight(mergedSize.value)
        nextWrapperStyle.width = typeof parseWidth === 'number' ? `${parseWidth}px` : parseWidth
      }
      else {
        const parseHeight = parseWidthHeight(mergedSize.value)
        nextWrapperStyle.height = typeof parseHeight === 'number' ? `${parseHeight}px` : parseHeight
      }
      return nextWrapperStyle
    })

    // =========================== Resize ===========================
    const wrapperRef = shallowRef<HTMLDivElement>()
    const isResizeable = computed(() => !!props.resizable)
    const resizeConfig = computed(() => typeof props?.resizable === 'object' ? props?.resizable : {})

    const onInternalResize = (size: number) => {
      currentSize.value = size
      resizeConfig?.value?.onResize?.(size)
    }
    const { dragElementProps, isDragging } = useDrag({
      prefixCls: computed(() => `${props.prefixCls}-resizable`),
      direction: placement as any,
      className: computed(() => props?.classNames?.dragger),
      style: computed(() => props?.styles?.dragger),
      maxSize,
      containerRef: wrapperRef,
      currentSize: mergedSize,
      onResize: onInternalResize,
      onResizeStart: () => resizeConfig?.value?.onResizeStart?.(),
      onResizeEnd: () => resizeConfig?.value?.onResizeEnd?.(),
    })
    return () => {
      const {
        onMouseEnter,
        onMouseOver,
        onMouseLeave,
        onClick,
        onKeyDown,
        onKeyUp,
        maskMotion,
        maskStyle,
        styles,
        prefixCls,
        classNames: drawerClassNames,
        maskClassName,
        maskClosable,
        onClose,
        id,
        drawerRender,
        motion,
        rootStyle,
        rootClassName,
        zIndex,
        inline,
        mask,
      } = props
      const { className, style, restAttrs } = getAttrStyleAndClass(attrs)

      const maskMotionProps = getTransitionProps(maskMotion?.name, maskMotion)

      // ============================ Mask ============================
      const maskNode = (
        <Transition key="mask" {...maskMotionProps}>
          <div
            v-show={open.value}
            class={clsx(
              `${prefixCls}-mask`,
              drawerClassNames?.mask,
              maskClassName,
            )}
            style={[
              maskStyle,
              styles?.mask,
            ]}
            onClick={maskClosable && open.value ? onClose : undefined}
          />
        </Transition>
      )

      // =========================== Events ===========================
      const eventHandlers = {
        onMouseEnter,
        onMouseOver,
        onMouseLeave,
        onClick,
        onKeyDown,
        onKeyUp,
      }

      // =========================== Render ==========================
      // >>>>> Panel
      const content = (
        <DrawerPanel
          id={id}
          prefixCls={prefixCls}
          class={clsx(className, drawerClassNames?.section)}
          style={[style, styles?.section]}
          {...restAttrs}
          {...eventHandlers}
        >
          {slots?.default?.()}
        </DrawerPanel>
      )

      // =========================== Panel ============================
      const motionProps = typeof motion === 'function' ? motion(placement.value) : motion
      const panelMotionProps = getTransitionProps(motionProps?.name, motionProps)
      const panelNode = (
        <Transition
          {...panelMotionProps}
          onBeforeEnter={() => {
            props?.afterOpenChange?.(true)
          }}
          onAfterLeave={() => {
            props?.afterOpenChange?.(false)
          }}
        >
          <div
            v-show={open.value}
            ref={wrapperRef}
            class={clsx(
              `${prefixCls}-content-wrapper`,
              isDragging.value && `${prefixCls}-content-wrapper-dragging`,
              drawerClassNames?.wrapper,
            )}
            style={[
              wrapperStyle.value,
              styles?.wrapper,
            ]}
            {
              ...pickAttrs(restAttrs, { data: true })
            }
          >
            {isResizeable.value && <div {...dragElementProps.value} />}
            {drawerRender ? drawerRender(content) : content}
          </div>
        </Transition>
      )

      // >>>>> Container
      const containerStyle: CSSProperties = {
        ...rootStyle,
      }
      if (zIndex) {
        containerStyle.zIndex = zIndex
      }

      return (
        <div
          class={clsx(
            prefixCls,
            `${prefixCls}-${placement.value}`,
            rootClassName,
            {
              [`${prefixCls}-open`]: open.value,
              [`${prefixCls}-inline`]: inline,
            },
          )}
          style={containerStyle}
          tabindex={-1}
          ref={panelRef}
          onKeydown={onPanelKeyDown}
        >
          {mask && maskNode}
          <div
            tabindex={0}
            ref={sentinelStartRef}
            style={sentinelStyle}
            aria-hidden="true"
            data-sentinel="start"
          />
          {panelNode}
          <div
            tabindex={0}
            ref={sentinelEndRef}
            style={sentinelStyle}
            aria-hidden="true"
            data-sentinel="end"
          />
        </div>
      )
    }
  },
  {
    name: 'DrawerPopup',
    inheritAttrs: false,
  },
)

export default DrawerPopup
