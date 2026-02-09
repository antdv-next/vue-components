import type { PortalProps } from '@v-c/portal'
import type { VueNode } from '@v-c/util/dist/type'
import type { CSSMotionProps } from '@v-c/util/dist/utils/transition'
import type { CSSProperties } from 'vue'
import type { TriggerContextProps } from './context.ts'
import type { ActionType, AlignType, AnimationType, ArrowPos, ArrowTypeOuter, BuildInPlacements } from './interface'
import type { MobileConfig } from './Popup'
import Portal from '@v-c/portal'
import { useResizeObserver } from '@v-c/resize-observer'
import { classNames } from '@v-c/util'
import { getShadowRoot } from '@v-c/util/dist/Dom/shadow'
import { filterEmpty } from '@v-c/util/dist/props-util'
import { resolveToElement } from '@v-c/util/dist/vnode'
import { computed, createVNode, defineComponent, nextTick, reactive, ref, shallowRef, useId, watch, watchEffect } from 'vue'
import { TriggerContextProvider, useTriggerContext, useUniqueContext } from './context.ts'
import useAction from './hooks/useAction.ts'
import useAlign from './hooks/useAlign.ts'
import useDelay from './hooks/useDelay.ts'
import useWatch from './hooks/useWatch.ts'
import useWinClick from './hooks/useWinClick.ts'
import Popup from './Popup'
import { getAlignPopupClassName } from './util.ts'

export type {
  ActionType,
  AlignType,
  AnimationType,
  ArrowTypeOuter as ArrowType,
  BuildInPlacements,
}

export interface TriggerRef {
  nativeElement: HTMLElement
  popupElement: HTMLDivElement
  forceAlign: VoidFunction
}

// Removed Props List
// Seems this can be auto
// getDocument?: (element?: HTMLElement) => Document;

// New version will not wrap popup with `rc-trigger-popup-content` when multiple children

export interface TriggerProps {
  action?: ActionType | ActionType[]
  showAction?: ActionType[]
  hideAction?: ActionType[]

  prefixCls?: string

  zIndex?: number

  onPopupAlign?: (element: HTMLElement, align: AlignType) => void

  stretch?: string

  // ==================== Open =====================
  popupVisible?: boolean
  defaultPopupVisible?: boolean
  onOpenChange?: (visible: boolean) => void
  afterOpenChange?: (visible: boolean) => void
  /** @deprecated Use `onOpenChange` instead */
  onPopupVisibleChange?: (visible: boolean) => void
  /** @deprecated Use `afterOpenChange` instead */
  afterPopupVisibleChange?: (visible: boolean) => void

  // =================== Portal ====================
  getPopupContainer?: ((node: HTMLElement) => HTMLElement) | false
  forceRender?: boolean
  autoDestroy?: boolean

  // ==================== Mask =====================
  mask?: boolean
  maskClosable?: boolean

  // =================== Motion ====================
  /** Set popup motion. You can ref `rc-motion` for more info. */
  popupMotion?: CSSMotionProps
  /** Set mask motion. You can ref `rc-motion` for more info. */
  maskMotion?: CSSMotionProps

  // ==================== Delay ====================
  mouseEnterDelay?: number
  mouseLeaveDelay?: number

  focusDelay?: number
  blurDelay?: number

  // ==================== Popup ====================
  popup: VueNode | (() => VueNode)
  popupPlacement?: string
  builtinPlacements?: BuildInPlacements
  popupAlign?: AlignType
  popupClassName?: string
  /** Pass to `UniqueProvider` UniqueContainer */
  uniqueContainerClassName?: string
  /** Pass to `UniqueProvider` UniqueContainer */
  uniqueContainerStyle?: CSSProperties
  popupStyle?: CSSProperties
  getPopupClassNameFromAlign?: (align: AlignType) => string
  onPopupClick?: (e: MouseEvent) => void

  alignPoint?: boolean // Maybe we can support user pass position in the future

  /**
   * Trigger will memo content when close.
   * This may affect the case if want to keep content update.
   * Set `fresh` to `false` will always keep update.
   */
  fresh?: boolean

  /**
   * Config with UniqueProvider to shared the floating popup.
   */
  unique?: boolean

  // ==================== Arrow ====================
  arrow?: boolean | ArrowTypeOuter

  // // ========================== Mobile ==========================
  /**
   * @private
   * Will replace the config of root props.
   * This will directly trade as mobile view which will not check what real is.
   * This is internal usage currently, do not use in your prod.
   */
  mobile?: MobileConfig
}

const defaults = {
  prefixCls: 'vc-trigger-popup',
  action: 'hover',
  mouseLeaveDelay: 0.1,
  maskClosable: true,
  builtinPlacements: {},
  popupVisible: undefined,
  defaultPopupVisible: undefined,
} as any
export function generateTrigger(PortalComponent: any = Portal) {
  return defineComponent<TriggerProps>(
    (props = defaults, { expose, slots, attrs }) => {
      const mergedAutoDestroy = computed(() => props.autoDestroy ?? false)
      const openUncontrolled = computed(() => props.popupVisible === undefined)
      // =========================== Mobile ===========================
      const isMobile = computed(() => !!props.mobile)
      // ========================== Context ===========================
      const subPopupElements = ref<Record<string, HTMLElement | null>>({})
      const parentContext = useTriggerContext()
      const context = computed<TriggerContextProps>(() => {
        return {
          registerSubPopup(id, subPopupEle) {
            if (subPopupEle) {
              subPopupElements.value[id] = subPopupEle
            }
            else {
              delete subPopupElements.value[id]
            }
            parentContext?.value.registerSubPopup(id, subPopupEle)
          },
        }
      })
      // ======================== UniqueContext =========================
      const uniqueContext = useUniqueContext()
      // =========================== Popup ============================
      const id = useId()
      const popupEle = shallowRef<HTMLDivElement | null>(null)
      // Used for forwardRef popup. Not use internal
      const externalPopupRef = shallowRef<HTMLDivElement | null>(null)
      const setPopupRef = (node: any) => {
        const element = resolveToElement(node) as HTMLDivElement | null
        externalPopupRef.value = element
        if (popupEle.value !== element) {
          popupEle.value = element
        }
        parentContext?.value?.registerSubPopup(id, element ?? null)
      }

      // =========================== Target ===========================
      // Use state to control here since `useRef` update not trigger render
      const targetEle = shallowRef<HTMLElement>()
      // Used for forwardRef target. Not use internal
      const externalForwardRef = shallowRef<HTMLElement | null>(null)
      const setTargetRef = (node: any) => {
        const element = resolveToElement(node)
        if (element && targetEle.value !== element) {
          targetEle.value = element as HTMLElement
          externalForwardRef.value = element as HTMLElement
        }
        else if (!element) {
          targetEle.value = undefined
          externalForwardRef.value = null
        }
      }

      const originChildProps = reactive<Record<string, any>>({})
      const baseActionProps = shallowRef<Record<string, any>>({})
      const hoverActionProps = shallowRef<Record<string, any>>({})
      const cloneProps = computed<Record<string, any>>(() => ({
        ...baseActionProps.value,
        ...hoverActionProps.value,
      }))

      const inPopupOrChild = (ele: EventTarget) => {
        const childDOM = targetEle.value
        return (
          childDOM?.contains(ele as HTMLElement)
          || (childDOM && getShadowRoot(childDOM)?.host === ele)
          || ele === childDOM
          || popupEle.value?.contains(ele as HTMLElement)
          || (popupEle.value && getShadowRoot(popupEle.value)?.host === ele)
          || ele === popupEle.value
          || Object.values(subPopupElements.value)
            .some(
              subPopupEle => subPopupEle?.contains(ele as HTMLElement) || ele === subPopupEle,
            )
        )
      }

      // =========================== Arrow ============================
      const innerArrow = computed<ArrowTypeOuter | null>(() => {
        return props.arrow
          ? {
              ...props?.arrow !== true ? props?.arrow : {},
            }
          : null
      })

      // ============================ Open ============================
      const internalOpen = shallowRef(props?.defaultPopupVisible ?? false)

      if (props.popupVisible !== undefined) {
        internalOpen.value = props.popupVisible
      }

      // Render still use props as first priority
      const mergedOpen = computed(() => {
        return props?.popupVisible ?? internalOpen.value
      })

      const isOpen = () => mergedOpen.value

      watch(
        () => props.popupVisible,
        async (nextVisible) => {
          if (nextVisible !== undefined) {
            await nextTick()
            internalOpen.value = nextVisible
          }
        },
      )
      // Extract common options for UniqueProvider
      const getUniqueOptions = (delay: number = 0) => {
        return {
          popup: props.popup,
          target: targetEle.value,
          delay,
          prefixCls: props.prefixCls,
          popupClassName: props.popupClassName,
          uniqueContainerClassName: props.uniqueContainerClassName,
          uniqueContainerStyle: props.uniqueContainerStyle,
          popupStyle: props.popupStyle,
          popupPlacement: props.popupPlacement,
          builtinPlacements: props.builtinPlacements,
          popupAlign: props.popupAlign,
          zIndex: props.zIndex,
          mask: props.mask,
          maskClosable: props.maskClosable,
          popupMotion: props.popupMotion,
          maskMotion: props.maskMotion,
          arrow: innerArrow.value,
          getPopupContainer: props.getPopupContainer,
          getPopupClassNameFromAlign: props.getPopupClassNameFromAlign,
          id,
          onEsc,
        }
      }

      // Handle controlled state changes for UniqueProvider
      // Only sync to UniqueProvider when it's controlled mode
      // If there is a parentContext, don't call uniqueContext methods

      watch([mergedOpen, targetEle], () => {
        if (uniqueContext && props.unique && targetEle.value && !openUncontrolled.value && !parentContext?.value) {
          if (mergedOpen.value) {
            const enterDelay = props.mouseEnterDelay ?? 0
            uniqueContext?.show(getUniqueOptions(enterDelay) as any, isOpen)
          }
          else {
            uniqueContext?.hide(props.mouseLeaveDelay || 0)
          }
        }
      })

      const openRef = shallowRef(mergedOpen.value)
      watch(mergedOpen, () => {
        openRef.value = mergedOpen.value
      })

      const internalTriggerOpen = (nextOpen: boolean) => {
        if (mergedOpen.value !== nextOpen) {
          internalOpen.value = nextOpen
          props?.onOpenChange?.(nextOpen)
          props?.onPopupVisibleChange?.(nextOpen)
        }
      }

      // Trigger for delay
      const delayInvoke = useDelay()

      const triggerOpen = (nextOpen: boolean, delay: number = 0) => {
        // If it's controlled mode, always use internal trigger logic
        // UniqueProvider will be synced through useLayoutEffect
        if (props.popupVisible !== undefined) {
          delayInvoke(() => {
            internalTriggerOpen(nextOpen)
          }, delay)
          return
        }

        // If UniqueContext exists and not controlled, pass delay to Provider instead of handling it internally
        // If there is a parentContext, don't call uniqueContext methods
        if (uniqueContext && props.unique && openUncontrolled.value && !parentContext?.value) {
          if (nextOpen) {
            uniqueContext?.show(getUniqueOptions(delay) as any, isOpen)
          }
          else {
            uniqueContext.hide(delay)
          }
          return
        }

        delayInvoke(() => {
          internalTriggerOpen(nextOpen)
        }, delay)
      }

      function onEsc({ top }: Parameters<NonNullable<PortalProps['onEsc']>>[0]) {
        if (top) {
          triggerOpen(false)
        }
      }

      // ========================== Motion ============================
      const inMotion = shallowRef(false)
      watch(mergedOpen, () => {
        if (mergedOpen.value) {
          inMotion.value = true
        }
      })

      const motionPrepareResolve = shallowRef<VoidFunction>()
      // =========================== Align ============================
      const mousePos = ref<[x: number, y: number] | null>(null)
      const setMousePosByEvent = (event: any) => {
        mousePos.value = [event.clientX, event.clientY]
      }

      const [
        ready,
        offsetX,
        offsetY,
        offsetR,
        offsetB,
        arrowX,
        arrowY,
        scaleX,
        scaleY,
        alignInfo,
        onAlign,
      ] = useAlign(
        mergedOpen,
        popupEle as any,
        computed(() => props?.alignPoint && mousePos.value !== null ? mousePos.value : targetEle.value) as any,
        computed(() => props?.popupPlacement) as any,
        computed(() => props?.builtinPlacements) as any,
        computed(() => props?.popupAlign) as any,
        props?.onPopupAlign,
        isMobile,
      )

      const [showActions, hideActions] = useAction(
        computed(() => props.action!),
        computed(() => props.showAction!),
        computed(() => props.hideAction!),
      )
      const clickToShow = computed(() => showActions.value?.has('click'))
      const clickToHide = computed(() => hideActions.value?.has('click') || hideActions.value?.has('contextmenu'))
      const triggerAlign = () => {
        if (!inMotion.value) {
          onAlign()
        }
        else {
          onAlign(true)
        }
      }

      const onScroll = () => {
        if (openRef.value && props?.alignPoint && clickToHide.value) {
          triggerOpen(false)
        }
      }

      useWatch(mergedOpen, targetEle as any, popupEle as any, triggerAlign, onScroll)
      watch(
        [mousePos, () => props.popupPlacement],
        async () => {
          await nextTick()
          triggerAlign()
        },
      )
      watch(
        () => JSON.stringify(props.popupAlign),
        async () => {
          await nextTick()
          const { builtinPlacements, popupPlacement } = props
          if (mergedOpen.value && !builtinPlacements?.[popupPlacement!]) {
            triggerAlign()
          }
        },
      )
      const alignedClassName = computed(() => {
        const baseClassName = getAlignPopupClassName(
          props.builtinPlacements!,
          props.prefixCls!,
          alignInfo.value,
          props.alignPoint!,
        )
        return classNames(baseClassName, props?.getPopupClassNameFromAlign?.(alignInfo.value))
      })
      expose({
        nativeElement: externalForwardRef,
        popupElement: externalPopupRef,
        forceAlign: triggerAlign,
      })

      // ========================== Stretch ===========================
      const targetWidth = shallowRef(0)
      const targetHeight = shallowRef(0)

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
        onAlign()
        props?.afterOpenChange?.(visible)
        props?.afterPopupVisibleChange?.(visible)
      }

      // We will trigger align when motion is in prepare
      const onPrepare = () => {
        syncTargetSize()
        return new Promise<void>((resolve) => {
          motionPrepareResolve.value = resolve
          inMotion.value = true
        })
      }

      watch(
        [motionPrepareResolve],
        () => {
          if (motionPrepareResolve.value) {
            onAlign()
            motionPrepareResolve.value()
            motionPrepareResolve.value = undefined
          }
        },
        {
          flush: 'post',
        },
      )

      // =========================== Action ===========================
      /**
       * Util wrapper for trigger action
       * @param target
       * @param eventName  Listen event name
       * @param nextOpen  Next open state after trigger
       * @param delay Delay to trigger open change
       * @param callback Callback if current event need additional action
       * @param ignoreCheck  Ignore current event if check return true
       */
      function wrapperAction(
        target: Record<string, any>,
        eventName: string,
        nextOpen: boolean,
        delay?: number,
        callback?: (event: Event) => void,
        ignoreCheck?: () => boolean,
      ) {
        target[eventName] = (event: any, ...args: any[]) => {
          if (!ignoreCheck || !ignoreCheck()) {
            callback?.(event)
            triggerOpen(nextOpen, delay)
          }

          // Pass to origin
          originChildProps[eventName]?.(event, ...args)
        }
      }

      // ======================= Action: Touch ========================
      const touchToShow = computed(() => showActions.value?.has('touch'))
      const touchToHide = computed(() => hideActions.value?.has('touch'))
      /** Used for prevent `hover` event conflict with mobile env */
      const touchedRef = shallowRef(false)
      watchEffect(() => {
        const nextCloneProps: Record<string, any> = {}
        if (touchToShow.value || touchToHide.value) {
          nextCloneProps.onTouchstart = (...args: any[]) => {
            touchedRef.value = true

            if (openRef.value && touchToHide.value) {
              triggerOpen(false)
            }
            else if (!openRef.value && touchToShow.value) {
              triggerOpen(true)
            }

            // Pass to origin
            originChildProps.onTouchstart?.(...args)
          }
        }

        // ======================= Action: Click ========================
        if (clickToShow.value || clickToHide.value) {
          nextCloneProps.onClick = (
            event: MouseEvent,
            ...args: any[]
          ) => {
            if (openRef.value && clickToHide.value) {
              triggerOpen(false)
            }
            else if (!openRef.value && clickToShow.value) {
              setMousePosByEvent(event)

              triggerOpen(true)
            }

            // Pass to origin
            originChildProps?.onClick?.(event, ...args)
            touchedRef.value = false
          }
        }
        baseActionProps.value = nextCloneProps
      })

      // Click to hide is special action since click popup element should not hide
      const onPopupPointerDown = useWinClick(
        mergedOpen,
        computed(() => clickToHide.value || touchToHide.value),
        targetEle as any,
        popupEle as any,
        computed(() => props.mask) as any,
        computed(() => props.maskClosable) as any,
        inPopupOrChild,
        triggerOpen,
      )

      // ======================= Action: Hover ========================
      const hoverToShow = computed(() => showActions.value?.has('hover'))
      const hoverToHide = computed(() => hideActions.value?.has('hover'))

      let onPopupMouseEnter: any
      let onPopupMouseLeave: undefined | ((event: MouseEvent) => void)

      const ignoreMouseTrigger = () => {
        return touchedRef.value
      }

      watchEffect(() => {
        const { mouseEnterDelay, mouseLeaveDelay, alignPoint, focusDelay, blurDelay } = props
        const nextHoverProps: Record<string, any> = {}
        if (hoverToShow.value) {
          const onMouseEnterCallback = (event: any) => {
            setMousePosByEvent(event)
          }

          // Compatible with old browser which not support pointer event
          wrapperAction(
            nextHoverProps,
            'onMouseenter',
            true,
            mouseEnterDelay,
            onMouseEnterCallback,
            ignoreMouseTrigger,
          )
          wrapperAction(
            nextHoverProps,
            'onPointerenter',
            true,
            mouseEnterDelay,
            onMouseEnterCallback,
            ignoreMouseTrigger,
          )

          onPopupMouseEnter = (event: any) => {
            // Only trigger re-open when popup is visible
            if (
              (mergedOpen.value || inMotion.value)
              && popupEle?.value?.contains(event.target as HTMLElement)
            ) {
              triggerOpen(true, mouseEnterDelay)
            }
          }

          // Align Point
          if (alignPoint) {
            nextHoverProps.onMouseMove = (event: any) => {
              originChildProps.onMousemove?.(event)
            }
          }
        }
        else {
          onPopupMouseEnter = undefined
        }

        if (hoverToHide.value) {
          wrapperAction(
            nextHoverProps,
            'onMouseleave',
            false,
            mouseLeaveDelay,
            undefined,
            ignoreMouseTrigger,
          )
          wrapperAction(
            nextHoverProps,
            'onPointerleave',
            false,
            mouseLeaveDelay,
            undefined,
            ignoreMouseTrigger,
          )

          onPopupMouseLeave = (event: MouseEvent) => {
            const { relatedTarget } = event
            if (relatedTarget && inPopupOrChild(relatedTarget)) {
              return
            }
            triggerOpen(false, mouseLeaveDelay)
          }
        }
        else {
          onPopupMouseLeave = undefined
        }

        // ======================= Action: Focus ========================
        if (showActions.value.has('focus')) {
          wrapperAction(nextHoverProps, 'onFocus', true, focusDelay)
        }

        if (hideActions.value.has('focus')) {
          wrapperAction(nextHoverProps, 'onBlur', false, blurDelay)
        }

        // ==================== Action: ContextMenu =====================
        if (showActions.value.has('contextmenu')) {
          nextHoverProps.onContextmenu = (event: any, ...args: any[]) => {
            if (openRef.value && hideActions.value.has('contextmenu')) {
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
        hoverActionProps.value = nextHoverProps
      })

      // ============================ Perf ============================
      const rendedRef = shallowRef(false)
      watchEffect(() => {
        rendedRef.value ||= props.forceRender || mergedOpen.value || inMotion.value
      })
      // =================== Resize Observer ===================
      // Use hook to observe target element resize
      // Pass targetEle directly instead of a function so the hook will re-observe when target changes
      useResizeObserver(mergedOpen, targetEle, onTargetResize)
      return () => {
        // ========================== Children ==========================
        const child = filterEmpty(slots?.default?.({ open: mergedOpen.value }) ?? [])?.[0]
        // =========================== Render ===========================
        const mergedChildrenProps = {
          ...originChildProps,
          ...cloneProps.value,
        }
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
        passedEventList.forEach((eventName) => {
          if (attrs[eventName]) {
            passedProps[eventName] = (...args: any[]) => {
              mergedChildrenProps[eventName]?.(...args)
              ;(attrs as any)[eventName](...args)
            }
          }
        })

        const arrowPos: ArrowPos = {
          x: arrowX.value,
          y: arrowY.value,
        }
        // Child Node
        const triggerNode = createVNode(child, {
          ...mergedChildrenProps,
          ...passedProps,
          ref: setTargetRef,
        })
        const {
          unique,
          prefixCls,
          popup,
          popupClassName,
          popupStyle,
          zIndex,
          fresh,
          onPopupClick,
          mask,
          popupMotion,
          maskMotion,
          forceRender,
          getPopupContainer,
          stretch,
          mobile,
        } = props
        return (
          <>
            {triggerNode}
            {rendedRef.value && targetEle.value && (!uniqueContext || !unique) && (
              <TriggerContextProvider {...context.value}>
                <Popup
                  portal={PortalComponent}
                  ref={setPopupRef}
                  prefixCls={prefixCls!}
                  popup={popup!}
                  className={classNames(popupClassName, !isMobile.value && alignedClassName.value)}
                  style={popupStyle}
                  target={targetEle.value!}
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
                  onEsc={onEsc}
                  onPointerDownCapture={onPopupPointerDown}
                  // Mask
                  mask={mask}
                  // Motion
                  motion={popupMotion}
                  maskMotion={maskMotion}
                  onVisibleChanged={onVisibleChanged}
                  onPrepare={onPrepare}
                  // Portal
                  forceRender={forceRender}
                  autoDestroy={mergedAutoDestroy.value}
                  getPopupContainer={getPopupContainer}
                  // Arrow
                  align={alignInfo.value}
                  arrow={innerArrow.value!}
                  arrowPos={arrowPos}
                  // Align
                  ready={ready.value}
                  offsetX={offsetX.value}
                  offsetY={offsetY.value}
                  offsetR={offsetR.value}
                  offsetB={offsetB.value}
                  onAlign={triggerAlign}
                  // Stretch
                  stretch={stretch}
                  targetWidth={targetWidth.value / scaleX.value}
                  targetHeight={targetHeight.value / scaleY.value}
                  // Mobile
                  mobile={mobile}
                />
              </TriggerContextProvider>
            ) }
          </>
        )
      }
    },
  )
}

const Trigger = generateTrigger(Portal)

export { Trigger }
export default Trigger
export { default as UniqueProvider } from './UniqueProvider'
export type { UniqueProviderProps } from './UniqueProvider'
