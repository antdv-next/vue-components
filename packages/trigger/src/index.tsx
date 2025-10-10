import type { CSSProperties, ExtractPropTypes, PropType, SlotsType } from 'vue'
import type {
  ActionType,
  AlignType,
  ArrowPos,
  ArrowTypeOuter,
  BuildInPlacements,
  Placement,
} from './interface'

import ResizeObserver from '@v-c/resize-observer'
import { isDOM } from '@v-c/util/dist/Dom/findDOMNode'
import { getShadowRoot } from '@v-c/util/dist/Dom/shadow'
import useEvent from '@v-c/util/dist/hooks/useEvent'
import useId from '@v-c/util/dist/hooks/useId'
import isMobile from '@v-c/util/dist/isMobile'
import { cloneElement } from '@v-c/util/dist/vnode'
import { classNames } from '@v-c/util'

import { computed, defineComponent, nextTick, onBeforeUnmount, onMounted, ref, watch, watchEffect } from 'vue'
import { useProviderTriggerContext } from './context'
import useAction from './hooks/useAction'
import useAlign from './hooks/useAlign'
import useWatch from './hooks/useWatch'
import useWinClick from './hooks/useWinClick'
import { Popup } from './Popup'
import { getAlignPopupClassName, getMotion } from './util'

export type {
  ActionType,
  AlignType,
  ArrowTypeOuter as ArrowType,
  BuildInPlacements,
}

// Removed Props List
// Seems this can be auto
// getDocument?: (element?: HTMLElement) => Document;

// New version will not wrap popup with `rc-trigger-popup-content` when multiple children

function triggerProps() {
  return {
    action: {
      type: [String, Array] as PropType<ActionType | ActionType[]>,
    },
    showAction: { type: Array as PropType<ActionType[]> },
    hideAction: { type: Array as PropType<ActionType[]> },

    prefixCls: String,

    zIndex: Number,

    onPopupAlign: {
      type: Function as PropType<(element: HTMLElement, align: AlignType) => void>,
    },

    stretch: {
      type: String as PropType<'width' | 'height' | 'minWidth' | 'minHeight'>,
    },

    // ==================== Open =====================
    popupVisible: Boolean,
    defaultPopupVisible: Boolean,

    // =================== Portal ====================
    getPopupContainer: { type: Function as PropType<(node?: HTMLElement) => HTMLElement> },
    forceRender: Boolean,
    autoDestroy: Boolean,

    /** @deprecated Please use `autoDestroy` instead */
    destroyPopupOnHide: Boolean,

    // ==================== Mask =====================
    mask: Boolean,
    maskClosable: Boolean,

    // =================== Motion ====================
    /** Set popup motion. You can ref `rc-motion` for more info. */
    popupMotion: { type: Object as PropType<Record<string, any>> },
    /** Set mask motion. You can ref `rc-motion` for more info. */
    maskMotion: { type: Object as PropType<Record<string, any>> },

    /** @deprecated Please us `popupMotion` instead. */
    popupTransitionName: String,
    /** @deprecated Please us `popupMotion` instead. */
    popupAnimation: String,
    /** @deprecated Please us `maskMotion` instead. */
    maskTransitionName: String,
    /** @deprecated Please us `maskMotion` instead. */
    maskAnimation: String,

    // ==================== Delay ====================
    mouseEnterDelay: Number,
    mouseLeaveDelay: Number,

    focusDelay: Number,
    blurDelay: Number,

    // ==================== Popup ====================
    popup: String,
    popupPlacement: {
      type: String as PropType<Placement>,
      default: () => 'top',
    },
    builtinPlacements: Object,
    popupAlign: Object,
    popupClassName: String,
    popupStyle: [Object, String] as PropType<CSSProperties | string>,
    getPopupClassNameFromAlign: Function,
    onPopupClick: Function,

    alignPoint: Boolean, // Maybe we can support user pass position in the future

    /**
     * Trigger will memo content when close.
     * This may affect the case if want to keep content update.
     * Set `fresh` to `false` will always keep update.
     */
    fresh: Boolean,

    // ==================== Arrow ====================
    arrow: {
      type: [Boolean, Object] as PropType<boolean | ArrowTypeOuter>,
    },
    onOpenChange: Function as PropType<(visible: boolean) => void>,
    onAfterOpenChange: Function as PropType<(visible: boolean) => void>,
  }
}

export type TriggerProps = Partial<ExtractPropTypes<ReturnType<typeof triggerProps>>>

export const Trigger = defineComponent({
  name: 'Trigger',
  props: {
    ...triggerProps(),
  },
  slots: Object as SlotsType<{
    default: any
    popup: any
  }>,
  emits: ['afterOpenChange', 'openChange', 'popupAlign', 'popupClick', 'update:popupVisible'],
  setup(props, { attrs, slots, emit, expose }) {
    const triggerNodeRef = ref()
    const popupNodeRef = ref()
    const alignDetails = ref({
      ready: false,
      offsetX: 0,
      offsetY: 0,
      offsetR: 0,
      offsetB: 0,
      arrowX: 0,
      arrowY: 0,
      scaleX: 0,
      scaleY: 0,
      align: {},
      onAlign: () => {},
      resetReady: () => {},
    })
    let clickToHide: boolean
    let onPopupMouseEnter: (event: Event) => void
    let onPopupMouseLeave: VoidFunction
    let onPopupPointerDown: VoidFunction

    const mergedAutoDestroy = props.autoDestroy || props.destroyPopupOnHide || false

    // =========================== Mobile ===========================
    const mobile = ref(false)
    watch(mobile, () => {
      mobile.value = isMobile()
    })

    // ========================== Context ===========================
    const subPopupElements = ref<Record<string, HTMLElement>>({})
    const context = {
      registerSubPopup: (id: string, node: HTMLElement) => {
        subPopupElements.value[id] = node
      },
    }
    useProviderTriggerContext(context)

    // =========================== Popup ============================
    const id = useId()
    const popupEle = ref<HTMLDivElement | null>(null)

    // Used for forwardRef popup. Not use internal
    const externalPopupRef = ref<HTMLDivElement | null>(null)
    const setPopupRef = (node: HTMLDivElement) => {
      externalPopupRef.value = node
      if (isDOM(node) && popupEle.value !== node) {
        popupEle.value = node
      }
      // parentContext = useInjectTriggerContext()
      popupNodeRef.value.registerSubPopup(id, node)
    }
    const onPopupClick = (e: MouseEvent) => {
      emit('popupClick', e)
    }

    // =========================== Target ===========================
    // Use state to control here since `useRef` update not trigger render
    const targetEle = ref<HTMLElement | null>(null)

    const setTargetRef = () => {
      const node: HTMLDivElement = triggerNodeRef.value
      if (isDOM(node) && targetEle.value !== node) {
        targetEle.value = node
        // eslint-disable-next-line ts/no-use-before-define
        onTargetResize()
      }
    }

    // ========================== Children ==========================
    const child = slots.default?.()
    const originChildProps = child[0]?.props || {}
    let cloneProps: typeof originChildProps = {}

    const inPopupOrChild = useEvent((ele: EventTarget) => {
      const childDOM = targetEle.value
      return (
        childDOM?.contains(ele as HTMLElement)
        || getShadowRoot(childDOM as Node)?.host === ele
        || ele === childDOM
        || popupEle.value?.contains(ele as HTMLElement)
        || getShadowRoot(popupEle.value as Node)?.host === ele
        || ele === popupEle.value
        || Object.values(subPopupElements.value).some(
          subPopupEle =>
            subPopupEle?.contains(ele as HTMLElement) || ele === subPopupEle,
        )
      )
    })

    // ============================ Open ============================
    const internalOpen = ref(
      props.defaultPopupVisible || false,
    )

    // Render still use props as first priority
    const mergedOpen = computed(() => props.popupVisible || internalOpen.value)

    // We use effect sync here in case `popupVisible` back to `undefined`
    const setMergedOpen = useEvent((nextOpen: boolean) => {
      if (props.popupVisible === undefined || !props.popupVisible) {
        internalOpen.value = nextOpen
      }
      emit('update:popupVisible', nextOpen)
    })

    watch(() => props.popupVisible, (newPopupVisible) => {
      internalOpen.value = newPopupVisible
    })

    const openRef = ref(mergedOpen.value)
    openRef.value = mergedOpen.value

    const lastTriggerRef = ref<boolean[]>([])
    lastTriggerRef.value = []

    const internalTriggerOpen = useEvent((nextOpen: boolean) => {
      setMergedOpen(nextOpen)

      // Enter or Pointer will both trigger open state change
      // We only need take one to avoid duplicated change event trigger
      // Use `lastTriggerRef` to record last open type
      if (
        (lastTriggerRef.value[lastTriggerRef.value.length - 1]
          ?? mergedOpen.value) !== nextOpen
      ) {
        lastTriggerRef.value.push(nextOpen)
      }
      emit('openChange', nextOpen)
    })

    // Trigger for delay
    const delayRef = ref<any>()

    const clearDelay = () => {
      clearTimeout(delayRef.value)
    }

    const triggerOpen = (nextOpen: boolean, delay = 0) => {
      clearDelay()

      if (delay === 0) {
        internalTriggerOpen(nextOpen)
      }
      else {
        delayRef.value = setTimeout(() => {
          internalTriggerOpen(nextOpen)
        }, delay * 1000)
      }
    }

    onBeforeUnmount(() => clearDelay())

    // ========================== Motion ============================
    const inMotion = ref(false)

    watch(mergedOpen, (firsMount) => {
      inMotion.value = firsMount
    })

    const motionPrepareResolve = ref<(() => void) | null>(null)

    // =========================== Align ============================
    const mousePos = ref<[x: number, y: number] | null>(null)

    const setMousePosByEvent = (
      event: Pick<MouseEvent, 'clientX' | 'clientY'>,
    ) => {
      mousePos.value = [event.clientX, event.clientY]
    }

    watchEffect(() => {
      const {
        onPopupAlign,
        builtinPlacements = {},
        alignPoint,
        popupPlacement,
        popupAlign,
      } = props
      const [
        offsetInfo,
        onAlign,
        resetReady,
      ] = useAlign(
        mergedOpen.value,
        popupEle.value,
        alignPoint && mousePos.value !== null ? mousePos.value : targetEle.value,
        popupPlacement,
        builtinPlacements,
        popupAlign,
        onPopupAlign,
      )
      if (popupEle.value) {
        onAlign()
        nextTick(() => {
          alignDetails.value = {
            ...offsetInfo.value,
            onAlign,
            resetReady,
          }
        })
      }
    }, { flush: 'post' })

    const triggerAlign = useEvent(() => {
      if (!inMotion.value) {
        alignDetails.value.onAlign()
      }
    })

    const onScroll = () => {
      if (openRef.value && props.alignPoint && clickToHide) {
        triggerOpen(false)
      }
    }

    watch([mergedOpen, targetEle, popupEle], () => useWatch(mergedOpen.value, targetEle.value, popupEle.value, triggerAlign, onScroll))
    watch([mousePos, () => props.popupPlacement], () => {
      triggerAlign()
    })

    // When no builtinPlacements and popupAlign changed
    watch(() => props.popupAlign, () => {
      if (mergedOpen.value && !props.builtinPlacements?.[props.popupPlacement!]) {
        triggerAlign()
      }
    })

    // ========================== Stretch ===========================
    const targetWidth = ref(0)
    const targetHeight = ref(0)

    const syncTargetSize = () => {
      if (props.stretch && targetEle.value) {
        const rect = targetEle.value.getBoundingClientRect()
        targetWidth.value = rect.width
        targetHeight.value = rect.height
      }
    }

    const onTargetResize = () => {
      syncTargetSize()
      triggerAlign()
    }

    // ========================== Motion ============================
    const onVisibleChanged = (visible: boolean) => {
      inMotion.value = false
      alignDetails.value?.onAlign()
      emit('afterOpenChange', visible)
    }

    // We will trigger align when motion is in prepare
    const onPrepare = () => {
      return new Promise<void>((resolve) => {
        syncTargetSize()
        motionPrepareResolve.value = resolve
      })
    }

    watch(motionPrepareResolve, (newMpr) => {
      if (newMpr) {
        alignDetails.value?.onAlign()
        // motionPrepareResolve.value()
        newMpr()
        motionPrepareResolve.value = null
      }
    }, { flush: 'post' })

    // =========================== Action ===========================
    /**
     * Util wrapper for trigger action
     */
    function wrapperAction<Event>(
      eventName: string,
      nextOpen: boolean,
      delay?: number,
      preEvent?: (event: Event) => void,
    ) {
      cloneProps[eventName] = (event: any, ...args: any[]) => {
        preEvent?.(event)
        triggerOpen(nextOpen, delay)

        // Pass to origin
        originChildProps[eventName]?.(event, ...args)
      }
    }

    watchEffect((onCleanup) => {
      const {
        mask,
        action = 'hover',
        showAction,
        hideAction,
        maskClosable = true,
        // Delay
        mouseEnterDelay,
        mouseLeaveDelay = 0.1,
        focusDelay,
        blurDelay,
        alignPoint,
      } = props
      const [showActions, hideActions] = useAction(
        mobile.value,
        action,
        showAction,
        hideAction,
      )

      const clickToShow = showActions.has('click')
      clickToHide
          = hideActions.has('click') || hideActions.has('contextMenu')
      // ======================= Action: Click ========================
      if (clickToShow || clickToHide) {
        cloneProps.onClick = (
          event: MouseEvent,
          ...args: any[]
        ) => {
          if (openRef.value && clickToHide) {
            triggerOpen(false)
          }
          else if (!openRef.value && clickToShow) {
            setMousePosByEvent(event)
            triggerOpen(true)
          }

          // Pass to origin
          originChildProps.onClick?.(event, ...args)
        }
      }

      // Click to hide is special action since click popup element should not hide
      onPopupPointerDown = useWinClick(
        mergedOpen.value,
        clickToHide,
        targetEle.value!,
        popupEle.value!,
        mask,
        maskClosable,
        inPopupOrChild,
        triggerOpen,
      )

      // ======================= Action: Hover ========================
      const hoverToShow = showActions.has('hover')
      const hoverToHide = hideActions.has('hover')

      if (hoverToShow) {
        // Compatible with old browser which not support pointer event
        // react -> onMouseEnter
        // vue -> onMouseenter
        wrapperAction<MouseEvent>(
          'onMouseenter',
          true,
          mouseEnterDelay,
          (event) => {
            setMousePosByEvent(event)
          },
        )
        wrapperAction<PointerEvent>(
          'onPointerenter',
          true,
          mouseEnterDelay,
          (event) => {
            setMousePosByEvent(event)
          },
        )
        onPopupMouseEnter = (event) => {
          // Only trigger re-open when popup is visible
          if (
            (mergedOpen.value || inMotion.value)
            && popupEle.value?.contains(event.target as HTMLElement)
          ) {
            triggerOpen(true, mouseEnterDelay)
          }
        }

        // Align Point
        if (alignPoint) {
          cloneProps.onMousemove = (event: MouseEvent) => {
            // setMousePosByEvent(event);
            originChildProps.onMouseMove?.(event)
          }
        }
      }

      if (hoverToHide) {
        wrapperAction('onMouseleave', false, mouseLeaveDelay)
        wrapperAction('onPointerleave', false, mouseLeaveDelay)
        onPopupMouseLeave = () => {
          triggerOpen(false, mouseLeaveDelay)
        }
      }

      // ======================= Action: Focus ========================
      if (showActions.has('focus')) {
        wrapperAction('onFocus', true, focusDelay)
      }

      if (hideActions.has('focus')) {
        wrapperAction('onBlur', false, blurDelay)
      }

      // ==================== Action: ContextMenu =====================
      if (showActions.has('contextMenu')) {
        cloneProps.onContextmenu = (event: MouseEvent, ...args: any[]) => {
          if (openRef.value && hideActions.has('contextMenu')) {
            triggerOpen(false)
          }
          else {
            setMousePosByEvent(event)
            triggerOpen(true)
          }

          event.preventDefault()

          // Pass to origin
          originChildProps.onContextmenu?.(event, ...args)
        }
      }

      onCleanup(() => {
        // Reset clone props to clean up previous event handlers
        cloneProps = {}
      })
    })

    // Pass props into cloneProps for nest usage
    const passedProps: Record<string, any> = {}
    const passedEventList = [
      'onContextmenu',
      'onClick',
      'onMousedown',
      'onTouchstart',
      'onMouseenter',
      'onMouseleave',
      'onFocus',
      'onBlur',
    ]

    onMounted(() => {
      setTargetRef()
    })

    expose({
      getTriggerDOMNode: () => triggerNodeRef.value,
      forceAlign: () => triggerAlign(),
    })

    return () => {
      const {
        prefixCls = 'vc-trigger-popup',
        // Open
        popupVisible,
        mask,
        // Portal
        getPopupContainer,
        forceRender,

        // Popup
        popup,
        popupClassName,
        popupStyle,
        zIndex,
        stretch,

        // Motion
        popupMotion,
        maskMotion,
        popupAnimation = '',
        maskAnimation = '',
        fresh,
        // Arrow
        arrow,
        popupTransitionName = 'vc-trigger-popup-zoom',
        maskTransitionName = 'vc-trigger-mask-zoom',
        builtinPlacements = {},
        alignPoint,
        getPopupClassNameFromAlign,
        ...restProps
      } = props

      const {
        ready,
        offsetX,
        offsetY,
        offsetR,
        offsetB,
        arrowX,
        arrowY,
        scaleX,
        scaleY,
        align: alignInfo,
      } = alignDetails.value

      // =========================== Motion ===========================
      const mergePopupMotion: any = getMotion(
        prefixCls,
        popupMotion,
        popupAnimation,
        popupTransitionName,
      )

      const mergeMaskMotion: any = getMotion(
        prefixCls,
        maskMotion,
        maskAnimation,
        maskTransitionName,
      )

      const baseClassName = getAlignPopupClassName(
        builtinPlacements,
        prefixCls,
        alignInfo,
        alignPoint,
      )
      const alignedClassName = classNames(baseClassName, getPopupClassNameFromAlign?.(alignInfo))

      // ========================= ClassName ==========================
      if (attrs.class) {
        cloneProps.class = classNames(originChildProps.class, attrs.class)
      }

      // =========================== Render ===========================
      const mergedChildrenProps = {
        ...originChildProps,
        ...cloneProps,
      }

      passedEventList.forEach((eventName) => {
        if ((restProps as Record<string, any>)[eventName]) {
          passedProps[eventName] = (...args: any[]) => {
            mergedChildrenProps[eventName]?.(...args)
            // eslint-disable-next-line no-unexpected-multiline
            (restProps as Record<string, any>)[eventName](...args)
          }
        }
      })

      // Child Node
      const triggerNode = cloneElement(child, {
        ...passedProps,
        ...mergedChildrenProps,
        ref: triggerNodeRef,
      })

      const arrowPos: ArrowPos = {
        x: arrowX,
        y: arrowY,
      }

      const innerArrow: ArrowTypeOuter | null = arrow
        ? {
            // true and Object likely
            ...(arrow !== true ? arrow : {}),
          }
        : null

      const generateSlot = {
        default: () => popup ?? slots.popup?.(),
      }
      return (
        <>
          <ResizeObserver
            disabled={!mergedOpen.value}
            onResize={onTargetResize}
          >
            {triggerNode}
          </ResizeObserver>
          <Popup
            ref={popupNodeRef}
            prefixCls={prefixCls}
            class={classNames(popupClassName, alignedClassName)}
            style={popupStyle}
            target={targetEle.value}
            onMouseEnter={onPopupMouseEnter}
            onMouseLeave={onPopupMouseLeave}
            // https://github.com/ant-design/ant-design/issues/43924
            onPointerEnter={onPopupMouseEnter}
            zIndex={zIndex}
            // Open
            open={mergedOpen.value}
            keepDom={inMotion.value}
            fresh={fresh}
            // Click
            onClick={onPopupClick}
            onPointerDownCapture={onPopupPointerDown}
            // Mask
            mask={mask}
            // Motion
            motion={mergePopupMotion}
            maskMotion={mergeMaskMotion}
            onVisibleChanged={onVisibleChanged}
            onPrepare={onPrepare}
            // Portal
            forceRender={forceRender}
            autoDestroy={mergedAutoDestroy}
            getPopupContainer={getPopupContainer}
            // Arrow
            align={alignInfo}
            arrow={innerArrow}
            arrowPos={arrowPos}
            // Align
            ready={ready}
            offsetX={offsetX}
            offsetY={offsetY}
            offsetR={offsetR}
            offsetB={offsetB}
            onAlign={triggerAlign}
            // Stretch
            stretch={stretch}
            targetWidth={targetWidth.value / scaleX}
            targetHeight={targetHeight.value / scaleY}
            v-slots={generateSlot}
            onGetElement={setPopupRef}
          />
        </>
      )
    }
  },
})
