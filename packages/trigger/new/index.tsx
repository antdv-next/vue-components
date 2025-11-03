import type { VueNode } from '@v-c/util/dist/type'
import type { CSSMotionProps } from '@v-c/util/dist/utils/transition'
import type { CSSProperties } from 'vue'
import type { TriggerContextProps } from './context.ts'
import type { ActionType, AlignType, ArrowTypeOuter, BuildInPlacements } from './interface'
import type { MobileConfig } from './Popup'
import Portal from '@v-c/portal'
import { isDOM } from '@v-c/util/dist/Dom/findDOMNode.ts'
import { getShadowRoot } from '@v-c/util/dist/Dom/shadow.ts'
import { filterEmpty } from '@v-c/util/dist/props-util'
import { computed, defineComponent, nextTick, ref, shallowRef, useId, watch, watchEffect } from 'vue'
import { useTriggerContext, useUniqueContext } from './context.ts'
import useAction from './hooks/useAction.ts'
import useAlign from './hooks/useAlign.ts'
import useDelay from './hooks/useDelay.ts'
import useWatch from './hooks/useWatch.ts'

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
  getPopupContainer?: (node: HTMLElement) => HTMLElement
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
   * @private Bump fixed position at bottom in mobile.
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
} as any
export function generateTrigger(PortalComponent: any = Portal) {
  return defineComponent<TriggerProps>(
    (props = defaults, { expose, slots }) => {
      const mergedAutoDestroy = computed(() => props.autoDestroy ?? false)
      const openUncontrolled = computed(() => props.popupVisible === undefined)
      // =========================== Mobile ===========================
      const isMobile = computed(() => !!props.mobile)
      // ========================== Context ===========================
      const subPopupElements = ref<Record<string, HTMLElement>>({})
      const parentContext = useTriggerContext()
      const context = computed<TriggerContextProps>(() => {
        return {
          registerSubPopup(id, subPopupEle) {
            subPopupElements.value[id] = subPopupEle
            parentContext?.value.registerSubPopup(id, subPopupEle)
          },
        }
      })
      // ======================== UniqueContext =========================
      const uniqueContext = useUniqueContext()
      // =========================== Popup ============================
      const id = useId()
      const popupEle = shallowRef<HTMLDivElement>()
      // Used for forwardRef popup. Not use internal
      const externalPopupRef = shallowRef<HTMLDivElement>()
      const setPopupRef = (node: any) => {
        externalPopupRef.value = node
        if (isDOM(node) && popupEle.value !== node) {
          popupEle.value = node as HTMLDivElement
        }
        parentContext?.value?.registerSubPopup(id, node)
      }

      // =========================== Target ===========================
      // Use state to control here since `useRef` update not trigger render
      const targetEle = shallowRef<HTMLElement>()
      // Used for forwardRef target. Not use internal
      const externalForwardRef = shallowRef<HTMLElement>()
      const setTargetRef = (node: any) => {
        if (isDOM(node) && targetEle.value !== node) {
          targetEle.value = node as HTMLElement
          externalForwardRef.value = node as HTMLElement
        }
      }

      // ========================== Children ==========================
      const child = computed(() => {
        const childs = filterEmpty(slots?.default?.() ?? [])
        return childs?.[0]
      })
      const originChildProps = computed(() => {
        return child?.value?.props || {}
      })
      const cloneProps = shallowRef({})

      const inPopupOrChild = (ele: EventTarget) => {
        const childDOM = targetEle.value
        return (
          childDOM?.contains(ele as HTMLElement)
          || getShadowRoot(childDOM!)?.host === ele
          || ele === childDOM
          || popupEle.value?.contains(ele as HTMLElement)
          || getShadowRoot(popupEle.value!)?.host === ele
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
      const internalOpen = shallowRef(props?.defaultPopupVisible || false)

      // Render still use props as first priority
      const mergedOpen = computed(() => {
        return props?.popupVisible ?? internalOpen.value
      })

      const setMergedOpen = (nextOpen: boolean) => {
        if (openUncontrolled.value) {
          internalOpen.value = nextOpen
        }
      }
      const isOpen = () => mergedOpen.value

      watchEffect(async () => {
        await nextTick()
        internalOpen.value = props?.popupVisible || false
      })
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
        }
      }

      // Handle controlled state changes for UniqueProvider
      // Only sync to UniqueProvider when it's controlled mode
      // If there is a parentContext, don't call uniqueContext methods

      watch([mergedOpen, targetEle], () => {
        if (uniqueContext && props.unique && targetEle.value && !openUncontrolled.value && !parentContext.value) {
          if (mergedOpen.value) {
            uniqueContext?.show(getUniqueOptions(props.mouseLeaveDelay) as any, isOpen)
          }
          else {
            uniqueContext?.hide(props.mouseLeaveDelay || 0)
          }
        }
      })

      const openRef = shallowRef(mergedOpen.value)
      // watchEffect(() => {
      //   openRef.value = mergedOpen.value
      // })

      const lastTriggerRef = shallowRef<boolean[]>([])
      lastTriggerRef.value = []

      const internalTriggerOpen = (nextOpen: boolean) => {
        setMergedOpen(nextOpen)
        // Enter or Pointer will both trigger open state change
        // We only need take one to avoid duplicated change event trigger
        // Use `lastTriggerRef` to record last open type
        if ((lastTriggerRef.value[lastTriggerRef.value.length - 1] ?? mergedOpen.value) !== nextOpen) {
          lastTriggerRef.value.push(nextOpen)
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
        if (uniqueContext && props.unique && openUncontrolled.value && !parentContext) {
          if (nextOpen) {
            uniqueContext?.show(getUniqueOptions(delay) as any, isOpen)
          }
          else {
            uniqueContext.hide(delay)
          }
        }

        delayInvoke(() => {
          internalTriggerOpen(nextOpen)
        }, delay)
      }

      // ========================== Motion ============================
      const inMotion = shallowRef(false)
      watch(mergedOpen, async () => {
        await nextTick()
        if (mergedOpen.value) {
          inMotion.value = true
        }
      })

      const motionPrepareResolve = shallowRef<VoidFunction>()
      // =========================== Align ============================
      const mousePos = ref<[x: number, y: number] | null>(null)
      const setMousePosEvent = (event: any) => {
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
      const clickToHide = computed(() => hideActions.value?.has('click') || hideActions.value?.has('contextMenu'))
      const triggerAlign = () => {
        if (!inMotion.value) {
          onAlign()
        }
      }

      const onScroll = () => {
        if (openRef.value && props?.alignPoint && clickToHide.value) {
          triggerOpen(false)
        }
      }

      useWatch(mergedOpen, targetEle as any, popupEle as any, triggerAlign, onScroll)

      expose({

      })
      return () => {
        return null
      }
    },
  )
}

export default generateTrigger(Portal)
