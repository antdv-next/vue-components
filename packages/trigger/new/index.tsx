import type { VueNode } from '@v-c/util/dist/type'
import type { CSSMotionProps } from '@v-c/util/dist/utils/transition'
import type { CSSProperties } from 'vue'
import type {
  ActionType,
  AlignType,
  ArrowTypeOuter,
  BuildInPlacements,
} from './interface'
import type { MobileConfig } from './Popup'

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
