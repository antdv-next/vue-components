import type { AlignType, BuildInPlacements } from '@v-c/trigger'
import type { VueNode } from '@v-c/util/dist/type'
import type { ScrollConfig, ScrollTo } from '@v-c/virtual-list'
import type { CSSProperties } from 'vue'
import type { ComponentsConfig } from '../hooks/useComponents'
import type {
  DisplayInfoType,
  DisplayValueType,
  Mode,
  Placement,
  RawValueType,
  RenderDOMFunc,
  RenderNode,
} from '../interface'
import { getDOM } from '@v-c/util/dist/Dom/findDOMNode'
import { toPropsRefs } from '@v-c/util/src/props-util'
import { computed, defineComponent, shallowRef } from 'vue'
import useComponents from '../hooks/useComponents'

export type BaseSelectSemanticName = 'prefix'
  | 'suffix'
  | 'input'
  | 'clear'
  | 'placeholder'
  | 'content'
  | 'item'
  | 'itemContent'
  | 'itemRemove'

/**
 * ZombieJ:
 * We are currently refactoring the semantic structure of the component. Changelog:
 * - Remove `suffixIcon` and change to `suffix`.
 * - Add `components.root` for replacing response element.
 *   - Remove `getInputElement` and `getRawInputElement` since we can use `components.input` instead.
 */

export type {
  DisplayInfoType,
  DisplayValueType,
  Mode,
  Placement,
  RawValueType,
  RenderDOMFunc,
  RenderNode,
}

export interface RefOptionListProps {
  onKeyDown: (event: KeyboardEvent) => void
  onKeyUp: (event: KeyboardEvent) => void
  scrollTo: (args: number | ScrollConfig) => void
}

export interface CustomTagProps {
  label: VueNode
  value: any
  disabled: boolean
  onClose: (event?: MouseEvent) => void
  closable: boolean
  isMaxTag: boolean
  index: number
}

export interface BaseSelectRef {
  focus: (options?: FocusOptions) => void
  blur: () => void
  scrollTo: ScrollTo
  nativeElement: HTMLElement
}

export interface BaseSelectPrivateProps {
  // >>> MISC
  id: string
  prefixCls: string
  omitDomProps?: string[]

  // >>> Value
  displayValues: DisplayValueType[]
  onDisplayValuesChange: (
    values: DisplayValueType[],
    info: {
      type: DisplayInfoType
      values: DisplayValueType[]
    },
  ) => void

  // >>> Active
  /** Current dropdown list active item string value */
  activeValue?: string
  /** Link search input with target element */
  activeDescendantId?: string
  onActiveValueChange?: (value: string | null) => void

  // >>> Search
  searchValue: string
  autoClearSearchValue?: boolean
  /** Trigger onSearch, return false to prevent trigger open event */
  onSearch: (
    searchValue: string,
    info: {
      source:
        | 'typing' // User typing
        | 'effect' // Code logic trigger
        | 'submit' // tag mode only
        | 'blur' // Not trigger event
    },
  ) => void
  /** Trigger when search text match the `tokenSeparators`. Will provide split content */
  onSearchSplit?: (words: string[]) => void

  // >>> Dropdown
  OptionList: any
  /** Tell if provided `options` is empty */
  emptyOptions: boolean
}

export type BaseSelectPropsWithoutPrivate = Omit<BaseSelectProps, 'id' | 'prefixCls' | 'omitDomProps' | 'displayValues' | 'onDisplayValuesChange' | 'activeValue' | 'activeDescendantId' | 'onActiveValueChange' | 'searchValue' | 'autoClearSearchValue' | 'onSearch' | 'onSearchSplit' | 'OptionList' | 'emptyOptions'>

export interface BaseSelectProps extends BaseSelectPrivateProps {
  // Style
  className?: string
  style?: CSSProperties
  classNames?: Partial<Record<BaseSelectSemanticName, string>>
  styles?: Partial<Record<BaseSelectSemanticName, CSSProperties>>

  // Selector
  showSearch?: boolean
  tagRender?: (props: CustomTagProps) => any
  direction?: 'ltr' | 'rtl'
  autoFocus?: boolean
  placeholder?: VueNode
  maxCount?: number

  // MISC
  title?: string
  tabIndex?: number
  notFoundContent?: VueNode
  onClear?: () => void
  maxLength?: number
  showScrollBar?: boolean | 'optional'

  choiceTransitionName?: string

  // >>> Mode
  mode?: Mode

  // >>> Status
  disabled?: boolean
  loading?: boolean

  // >>> Open
  open?: boolean
  defaultOpen?: boolean
  onPopupVisibleChange?: (open: boolean) => void

  // >>> Customize Input
  /** @private Internal usage. Do not use in your production. */
  getInputElement?: () => any
  /** @private Internal usage. Do not use in your production. */
  getRawInputElement?: () => any

  // >>> Selector
  maxTagTextLength?: number
  maxTagCount?: number | 'responsive'
  maxTagPlaceholder?: VueNode | ((omittedValues: DisplayValueType[]) => any)

  // >>> Icons
  allowClear?: boolean | { clearIcon?: VueNode }
  prefix?: VueNode
  /** @deprecated Please use `suffix` instead. */
  suffixIcon?: RenderNode
  suffix?: RenderNode
  /**
   * Clear all icon
   * @deprecated Please use `allowClear` instead
   */
  clearIcon?: VueNode
  /** Selector remove icon */
  removeIcon?: RenderNode

  // >>> Dropdown/Popup
  animation?: string
  transitionName?: string

  popupStyle?: CSSProperties
  popupClassName?: string
  popupMatchSelectWidth?: boolean | number
  popupRender?: (menu: any) => any
  popupAlign?: AlignType

  placement?: Placement
  builtinPlacements?: BuildInPlacements
  getPopupContainer?: RenderDOMFunc

  // >>> Focus
  showAction?: ('focus' | 'click')[]
  onBlur?: (event: FocusEvent) => void
  onFocus?: (event: FocusEvent) => void

  onKeyUp?: (event: KeyboardEvent) => void
  onKeyDown?: (event: KeyboardEvent) => void
  onMouseDown?: (event: MouseEvent) => void
  onPopupScroll?: (e: Event) => void
  onInputKeyDown?: (event: KeyboardEvent) => void
  onMouseEnter?: (event: MouseEvent) => void
  onMouseLeave?: (event: MouseEvent) => void
  onClick?: (event: MouseEvent) => void

  // >>> Components
  components?: ComponentsConfig
}

export const isMultiple = (mode: Mode) => mode === 'tags' || mode === 'multiple'

const defaults = {
  showScrollBar: 'optional',
  notFoundContent: 'Not Found',
  showAction: [],
} as any
export const BaseSelect = defineComponent<
  BaseSelectProps
>(
  (props, { attrs, expose }) => {
    const {
      mode,
      getInputElement,
      getRawInputElement,
      components,
      searchValue,
      displayValues,
    } = toPropsRefs(
      props,
      'mode',
      'getInputElement',
      'getRawInputElement',
      'components',
      'searchValue',
      'displayValues',
    )
    // ============================== MISC ==============================
    const multiple = computed(() => isMultiple(mode.value!))
    // ============================== Refs ==============================
    const containerRef = shallowRef()
    const triggerRef = shallowRef()
    const listRef = shallowRef()

    /** Used for component focused management */
    const focused = shallowRef(false)

    // =========================== Imperative ===========================
    expose({
      focus: (...args: any) => containerRef.value?.focus?.(...args),
      blur: () => containerRef.value?.blur?.(),
      scrollTo: (arg: ScrollTo) => listRef.value?.scrollTo(arg),
      nativeElement: computed(() => getDOM(containerRef)),
    })

    // =========================== Components ===========================
    const mergedComponents = useComponents(components as any, getInputElement as any, getRawInputElement as any)

    // ========================== Search Value ==========================
    const mergedSearchValue = computed(() => {
      if (mode.value !== 'combobox') {
        return searchValue.value
      }
      const val = displayValues.value?.[0]?.value
      return typeof val === 'string' || typeof val === 'number' ? String(val) : ''
    })
    return () => {
      return null
    }
  },
)
