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
import { clsx } from '@v-c/util'
import { getDOM } from '@v-c/util/dist/Dom/findDOMNode'
import { KeyCodeStr } from '@v-c/util/dist/KeyCode'
import omit from '@v-c/util/dist/omit'
import { computed, defineComponent, shallowRef, watch } from 'vue'
import { useAllowClear } from '../hooks/useAllowClear'
import { useBaseSelectProvider } from '../hooks/useBaseProps'
import useComponents from '../hooks/useComponents'
import useLock from '../hooks/useLock'
import useOpen from '../hooks/useOpen'
import useSelectTriggerControl from '../hooks/useSelectTriggerControl'
import SelectInput from '../SelectInput'
import SelectTrigger from '../SelectTrigger'
import { getSeparatedContent, isValidCount } from '../utils/valueUtil'
import Polite from './Polite'

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

export type BaseSelectPropsWithoutPrivate = Omit<BaseSelectProps, keyof BaseSelectPrivateProps>

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

  // >>> Search
  tokenSeparators?: string[]

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

const omitKeys = [
  'id',
  'prefixCls',
  'className',
  'styles',
  'classNames',
  'showSearch',
  'tagRender',
  'showScrollBar',
  'direction',
  'omitDomProps',

  // Value
  'displayValues',
  'onDisplayValuesChange',
  'emptyOptions',
  'notFoundContent',
  'onClear',
  'maxCount',
  'placeholder',

  // Mode
  'mode',

  // Status
  'disabled',
  'loading',

  // Customize Input
  'getInputElement',
  'getRawInputElement',

  // Open
  'open',
  'defaultOpen',
  'onPopupVisibleChange',

  // Active
  'activeValue',
  'onActiveValueChange',
  'activeDescendantId',

  // Search
  'searchValue',
  'autoClearSearchValue',
  'onSearch',
  'onSearchSplit',
  'tokenSeparators',

  // Icons
  'allowClear',
  'prefix',
  'suffix',
  'suffixIcon',
  'clearIcon',

  // Dropdown
  'OptionList',
  'animation',
  'transitionName',
  'popupStyle',
  'popupClassName',
  'popupMatchSelectWidth',
  'popupRender',
  'popupAlign',
  'placement',
  'builtinPlacements',
  'getPopupContainer',

  // Focus
  'showAction',
  'onFocus',
  'onBlur',

  // Rest Events
  'onKeyUp',
  'onKeyDown',
  'onMouseDown',

  // Components
  'components',
] as const

const defaults = {
  showScrollBar: 'optional',
  notFoundContent: 'Not Found',
  showAction: [],
} as any
export const BaseSelect = defineComponent<
  BaseSelectProps
>(
  (props = defaults, { expose, attrs }) => {
    // ============================== Refs for props ==============================
    const mode = computed(() => props.mode)
    const getInputElement = computed(() => props.getInputElement)
    const getRawInputElement = computed(() => props.getRawInputElement)
    const components = computed(() => props.components)
    const searchValue = computed(() => props.searchValue)
    const displayValues = computed(() => props.displayValues)
    const open = computed(() => props.open)
    const tokenSeparators = computed(() => props.tokenSeparators)
    const disabled = computed(() => props.disabled)

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

    const mergedNotFoundContent = computed(() => {
      return props.notFoundContent ?? 'Not Found'
    })

    // ============================== Open ==============================
    // Not trigger `open` when `notFoundContent` is empty
    const emptyListContent = computed(() => !mergedNotFoundContent.value && props.emptyOptions)
    const [mergedOpen, triggerOpen] = useOpen(
      open as any,
      (openVal) => {
        props.onPopupVisibleChange?.(openVal)
      },
      (nextOpen) => {
        return props.disabled || emptyListContent.value ? false : nextOpen
      },
    )

    // ============================= Search =============================
    const tokenWithEnter = computed(() => {
      return (tokenSeparators.value || []).some((tokenSeparator: string) => ['\n', '\r\n'].includes(tokenSeparator))
    })

    const onInternalSearch = (searchText: string, fromTyping: boolean, isCompositing: boolean) => {
      const { maxCount } = props
      if (multiple.value && isValidCount(maxCount) && displayValues.value.length >= maxCount!) {
        return
      }
      let ret = true
      let newSearchText = searchText
      props?.onActiveValueChange?.(null)

      const separatedList = getSeparatedContent(
        searchText,
        tokenSeparators.value as string[],
        isValidCount(maxCount) ? maxCount! - displayValues.value.length : undefined,
      )

      // Check if match the `tokenSeparators`
      const patchLabels: string[] | null = isCompositing ? null : separatedList

      // Ignore combobox since it's not split-able
      if (mode.value !== 'combobox' && patchLabels) {
        newSearchText = ''
        props?.onSearchSplit?.(patchLabels)

        // Should close when paste finish
        triggerOpen(false)
        // Tell Selector that break next actions
        ret = false
      }

      if (props.onSearch && mergedSearchValue.value !== newSearchText) {
        props?.onSearch?.(newSearchText, {
          source: fromTyping ? 'typing' : 'effect',
        })
      }
      // Open if from typing
      if (searchText && fromTyping && ret) {
        triggerOpen(true)
      }
      return ret
    }

    // Only triggered when menu is closed & mode is tags
    // If menu is open, OptionList will take charge
    // If mode isn't tags, press enter is not meaningful when you can't see any option
    const onInternalSearchSubmit = (searchText: string) => {
      // prevent empty tags from appearing when you click the Enter button
      if (!searchText || !searchText.trim()) {
        return
      }
      props?.onSearch?.(searchText, { source: 'submit' })
    }

    // Close will clean up single mode search text
    watch(
      mergedOpen,
      () => {
        if (!mergedOpen.value && !multiple.value && mode.value !== 'combobox') {
          onInternalSearch('', false, false)
        }
      },
      {
        immediate: true,
      },
    )

    // ============================ Disabled ============================
    // Close dropdown & remove focus state when disabled change
    watch([disabled, mergedOpen], () => {
      if (disabled.value) {
        triggerOpen(false)
        focused.value = false
      }
    }, {
      immediate: true,
    })

    // ============================ Keyboard ============================
    /**
     * We record input value here to check if can press to clean up by backspace
     * - null: Key is not down, this is reset by key up
     * - true: Search text is empty when first time backspace down
     * - false: Search text is not empty when first time backspace down
     */
    const [getClearLock, setClearLock] = useLock()
    const keyLockRef = shallowRef(false)

    // KeyDown
    const onInternalKeyDown = (event: KeyboardEvent) => {
      const clearLock = getClearLock()
      const { key } = event
      const isEnterKey = key === KeyCodeStr.Enter

      if (isEnterKey) {
        // Do not submit form when type in the input
        if (mode.value !== 'combobox') {
          event.preventDefault()
        }

        // We only manage open state here, close logic should handle by list component
        if (!mergedOpen.value) {
          triggerOpen(true)
        }
      }

      setClearLock(!!mergedSearchValue.value)

      // Remove value by `backspace`
      if (
        key === KeyCodeStr.Backspace
        && !clearLock && multiple.value
        && !mergedSearchValue.value
        && displayValues.value.length
      ) {
        const cloneDisplayValues = [...displayValues.value]
        let removedDisplayValue: DisplayValueType | null = null

        for (let i = cloneDisplayValues.length - 1; i >= 0; i -= 1) {
          const current = cloneDisplayValues[i]
          if (!current.disabled) {
            cloneDisplayValues.splice(i, 1)
            removedDisplayValue = current
            break
          }
        }
        if (removedDisplayValue) {
          props?.onDisplayValuesChange(cloneDisplayValues, {
            type: 'remove',
            values: [removedDisplayValue],
          })
        }
      }

      // Lock other operations until key up
      if (mergedOpen.value && (!isEnterKey || !keyLockRef.value)) {
        // Lock the Enter key after it is pressed to avoid repeated triggering of the onChange event.
        if (isEnterKey) {
          keyLockRef.value = true
        }
        listRef.value?.onKeyDown?.(event)
      }
      props?.onKeyDown?.(event)
    }

    const onInternalKeyUp = (event: KeyboardEvent) => {
      if (mergedOpen.value) {
        listRef.value?.onKeyUp?.(event)
      }
      if (event.key === KeyCodeStr.Enter) {
        keyLockRef.value = false
      }
      props?.onKeyUp?.(event)
    }

    // ============================ Selector ============================
    const onSelectorRemove = (val: DisplayValueType) => {
      const newValues = displayValues.value.filter((i: DisplayValueType) => i !== val)

      props?.onDisplayValuesChange(newValues, {
        type: 'remove',
        values: [val],
      })
    }

    const onInputBlur = () => {
      // Unlock the Enter key after the input blur; otherwise, the Enter key needs to be pressed twice to trigger the correct effect.
      keyLockRef.value = false
    }

    // ========================== Focus / Blur ==========================
    const onInternalFocus = (event: FocusEvent) => {
      focused.value = true
      if (!disabled.value) {
        // `showAction` should handle `focus` if set
        if (props.showAction?.includes?.('focus')) {
          triggerOpen(true)
        }

        props?.onFocus?.(event)
      }
    }

    const onInternalBlur = (event: FocusEvent) => {
      focused.value = false
      if (mergedSearchValue.value) {
        // `tags` mode should move `searchValue` into values
        if (mode.value === 'tags') {
          props?.onSearch?.(mergedSearchValue.value, { source: 'submit' })
        }
        else if (mode.value === 'multiple') {
          // `multiple` mode only clean the search value but not trigger event
          props?.onSearch?.('', { source: 'blur' })
        }
      }
      if (!disabled.value) {
        triggerOpen(false, {
          lazy: true,
        })
        props?.onBlur?.(event)
      }
    }

    const onInternalMouseDown = (event: MouseEvent) => {
      const { target } = event

      const popupElement: HTMLDivElement = triggerRef?.value?.getPopupElement?.()
      // We should give focus back to selector if clicked item is not focusable
      if (popupElement?.contains?.(target as HTMLElement) && triggerOpen) {
        triggerOpen(true, {
          ignoreNext: true,
        })
      }
      props?.onMouseDown?.(event)
    }

    // ============================ Dropdown ============================
    const forceState = shallowRef({})
    // We need force update here since popup dom is render async
    function onPopupMouseEnter() {
      forceState.value = {}
    }

    useSelectTriggerControl(
      () => [getDOM(containerRef) as any, triggerRef.value?.getPopupElement?.()],
      mergedOpen,
      triggerOpen,
      computed(() => !!mergedComponents.value.root),
    )

    // ============================ Context =============================
    const baseSelectContext = computed(() => {
      return {
        ...props,
        notFoundContent: mergedNotFoundContent.value,
        open: mergedOpen.value,
        triggerOpen: mergedOpen.value,
        toggleOpen: triggerOpen,
        multiple: multiple.value,
      }
    })

    // Provide context
    useBaseSelectProvider(baseSelectContext)

    // ============================= Clear ==============================
    const onClearMouseDown = () => {
      props?.onClear?.()
      containerRef.value?.focus?.()
      props?.onDisplayValuesChange([], {
        type: 'clear',
        values: displayValues.value,
      })
      onInternalSearch('', false, false)
    }
    const allowClearConfig = useAllowClear(
      computed(() => props.prefixCls),
      displayValues,
      computed(() => props.allowClear ?? false),
      computed(() => props.clearIcon),
      computed(() => disabled.value ?? false),
      mergedSearchValue,
      mode,
    )
    return () => {
      const {
        OptionList,
        prefixCls,
        className,
        loading,
        showSearch,
        prefix,
        placeholder,
        activeValue,
        animation,
        transitionName,
        popupStyle,
        popupClassName,
        direction,
        popupMatchSelectWidth,
        popupRender,
        popupAlign,
        placement,
        builtinPlacements,
        getPopupContainer,
        emptyOptions,
      } = props
      const mergedAllowClear = allowClearConfig.value.allowClear
      const clearNode = allowClearConfig.value.clearIcon
      // ========================== Custom Input ==========================
      // Only works in `combobox`
      const customizeInputElement = (mode.value === 'combobox' && typeof getInputElement.value === 'function' && getInputElement.value()) || null
      // Used for raw custom input trigger
      let onTriggerVisibleChange: null | ((newOpen: boolean) => void) = null
      if (mergedComponents.value?.root) {
        onTriggerVisibleChange = (newOpen: boolean) => {
          triggerOpen(newOpen)
        }
      }

      // ============================= Suffix =============================
      const mergedSuffixIconFn = () => {
        const nextSuffix = props.suffix ?? props?.suffixIcon
        if (typeof nextSuffix === 'function') {
          return (nextSuffix as any)?.({
            searchValue: mergedSearchValue.value,
            open: mergedOpen.value,
            focused: focused.value,
            showSearch: props.showSearch,
            loading: props.loading,
          })
        }
        return nextSuffix
      }
      const mergedSuffixIcon = mergedSuffixIconFn()

      // =========================== OptionList ===========================
      const optionList = <OptionList ref={listRef} />

      // ============================= Select =============================
      const mergedClassName = clsx(prefixCls, className, {
        [`${prefixCls}-focused`]: focused.value,
        [`${prefixCls}-multiple`]: multiple.value,
        [`${prefixCls}-single`]: !multiple.value,
        [`${prefixCls}-allow-clear`]: mergedAllowClear,
        [`${prefixCls}-show-arrow`]: mergedSuffixIcon !== undefined && mergedSuffixIcon !== null,
        [`${prefixCls}-disabled`]: disabled.value,
        [`${prefixCls}-loading`]: loading,
        [`${prefixCls}-open`]: mergedOpen.value,
        [`${prefixCls}-customize-input`]: customizeInputElement,
        [`${prefixCls}-show-search`]: showSearch,
      })

      // >>> Render
      let renderNode = (
        <SelectInput
          {...attrs}
          {...omit(props, omitKeys)}
          // Ref
          ref={containerRef}
          // Style
          prefixCls={prefixCls}
          className={mergedClassName}
          // Focus state
          focused={focused.value}
          // UI
          prefix={prefix}
          suffix={mergedSuffixIcon}
          clearIcon={clearNode}
          // Type or mode
          multiple={multiple.value}
          mode={mode.value}
          // Values
          displayValues={displayValues.value}
          placeholder={placeholder}
          searchValue={mergedSearchValue.value}
          activeValue={activeValue}
          onSearch={onInternalSearch}
          onSearchSubmit={onInternalSearchSubmit}
          onInputBlur={onInputBlur}
          onFocus={onInternalFocus}
          onBlur={onInternalBlur}
          onClearMouseDown={onClearMouseDown}
          onKeyDown={onInternalKeyDown}
          onKeyUp={onInternalKeyUp}
          onSelectorRemove={onSelectorRemove}
          // Token handling
          tokenWithEnter={tokenWithEnter.value}
          // Open
          onMouseDown={onInternalMouseDown}
          // Components
          components={mergedComponents.value}
        />
      )

      renderNode = (
        <SelectTrigger
          ref={triggerRef}
          disabled={disabled.value ?? false}
          prefixCls={prefixCls}
          visible={mergedOpen.value}
          popupElement={optionList}
          animation={animation}
          transitionName={transitionName}
          popupStyle={popupStyle}
          popupClassName={popupClassName}
          direction={direction}
          popupMatchSelectWidth={popupMatchSelectWidth}
          popupRender={popupRender}
          popupAlign={popupAlign}
          placement={placement}
          builtinPlacements={builtinPlacements}
          getPopupContainer={getPopupContainer}
          empty={emptyOptions}
          onPopupVisibleChange={onTriggerVisibleChange}
          onPopupMouseEnter={onPopupMouseEnter}
          onPopupMouseDown={onInternalMouseDown}
        >
          {renderNode}
        </SelectTrigger>
      )

      return (
        <>
          <Polite visible={focused.value && !mergedOpen.value} values={displayValues.value} />
          {renderNode}
        </>
      )
    }
  },
  {
    name: 'BaseSelect',
    inheritAttrs: false,
  },
)
