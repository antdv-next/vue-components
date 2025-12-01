import type { AlignType, BuildInPlacements } from '@v-c/trigger'
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
import type { SelectInputRef } from '../SelectInput'
import type { RefTriggerProps } from '../SelectTrigger'
import { clsx } from '@v-c/util'
import useEvent from '@v-c/util/dist/hooks/useEvent'
import omit from '@v-c/util/dist/omit'
import { computed, defineComponent, shallowRef, watch } from 'vue'
import { useAllowClear } from '../hooks/useAllowClear'
import { useProvideBaseSelectContext } from '../hooks/useBaseProps'
import useComponents from '../hooks/useComponents'
import useLock from '../hooks/useLock'
import useOpen from '../hooks/useOpen'
import useSelectTriggerControl from '../hooks/useSelectTriggerControl'
import SelectInput from '../SelectInput'
import SelectTrigger from '../SelectTrigger'
import { getSeparatedContent, isValidCount } from '../utils/valueUtil'
import Polite from './Polite'

export type BaseSelectSemanticName
  = | 'prefix'
    | 'suffix'
    | 'input'
    | 'clear'
    | 'placeholder'
    | 'content'
    | 'item'
    | 'itemContent'
    | 'itemRemove'

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
  scrollTo?: (args: any) => void
}

export interface CustomTagProps {
  label: any
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
  scrollTo: (arg: any) => void
  nativeElement: HTMLElement
}

export interface BaseSelectPrivateProps {
  id: string
  prefixCls: string
  omitDomProps?: string[]
  displayValues: DisplayValueType[]
  onDisplayValuesChange: (
    values: DisplayValueType[],
    info: {
      type: DisplayInfoType
      values: DisplayValueType[]
    },
  ) => void
  activeValue?: string
  activeDescendantId?: string
  onActiveValueChange?: (value: string | null) => void
  searchValue: string
  autoClearSearchValue?: boolean
  onSearch: (
    searchValue: string,
    info: {
      source: 'typing' | 'effect' | 'submit' | 'blur'
    },
  ) => void
  onSearchSplit?: (words: string[]) => void
  OptionList: any
  emptyOptions: boolean
}

// Vue TSX type resolver struggles with Omit + keyof, keep a simple alias instead.
export type BaseSelectPropsWithoutPrivate = BaseSelectProps

export interface BaseSelectProps extends BaseSelectPrivateProps {
  className?: string
  style?: CSSProperties
  classNames?: Partial<Record<BaseSelectSemanticName, string>>
  styles?: Partial<Record<BaseSelectSemanticName, CSSProperties>>
  showSearch?: boolean
  tagRender?: (props: CustomTagProps) => any
  direction?: 'ltr' | 'rtl'
  autoFocus?: boolean
  placeholder?: any
  maxCount?: number
  title?: string
  tabIndex?: number
  notFoundContent?: any
  onClear?: () => void
  maxLength?: number
  showScrollBar?: boolean | 'optional'
  choiceTransitionName?: string
  mode?: Mode
  disabled?: boolean
  loading?: boolean
  open?: boolean
  defaultOpen?: boolean
  onPopupVisibleChange?: (open: boolean) => void
  getInputElement?: () => any
  getRawInputElement?: () => any
  maxTagTextLength?: number
  maxTagCount?: number | 'responsive'
  maxTagPlaceholder?: any | ((omittedValues: DisplayValueType[]) => any)
  tokenSeparators?: string[]
  allowClear?: boolean | { clearIcon?: any }
  prefix?: any
  suffixIcon?: RenderNode
  suffix?: RenderNode
  clearIcon?: any
  removeIcon?: RenderNode
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
  showAction?: ('focus' | 'click')[]
  onBlur?: (event: FocusEvent) => void
  onFocus?: (event: FocusEvent) => void
  onKeyUp?: (event: KeyboardEvent) => void
  onKeyDown?: (event: KeyboardEvent) => void
  onMouseDown?: (event: MouseEvent) => void
  onPopupScroll?: (event: UIEvent) => void
  onInputKeyDown?: (event: KeyboardEvent) => void
  onMouseEnter?: (event: MouseEvent) => void
  onMouseLeave?: (event: MouseEvent) => void
  onClick?: (event: MouseEvent) => void
  components?: ComponentsConfig
  role?: string
}

export const isMultiple = (mode: Mode) => mode === 'tags' || mode === 'multiple'

const BaseSelect = defineComponent<BaseSelectProps>(
  (props, { expose, attrs }) => {
    const multiple = computed(() => isMultiple(props.mode as Mode))

    const containerRef = shallowRef<SelectInputRef>()
    const triggerRef = shallowRef<RefTriggerProps>()
    const listRef = shallowRef<RefOptionListProps>()
    const focused = shallowRef(false)

    expose({
      focus: (options?: FocusOptions) => containerRef.value?.focus(options),
      blur: () => containerRef.value?.blur(),
      scrollTo: (arg: any) => listRef.value?.scrollTo?.(arg),
      get nativeElement() {
        return containerRef.value?.nativeElement
      },
    } as BaseSelectRef)

    const mergedComponents = useComponents(
      () => props.components,
      () => props.getInputElement,
      () => props.getRawInputElement,
    )

    const mergedSearchValue = computed(() => {
      if (props.mode !== 'combobox') {
        return props.searchValue
      }
      const val = props.displayValues?.[0]?.value
      return typeof val === 'string' || typeof val === 'number' ? String(val) : ''
    })

    const customizeInputElement = computed(() =>
      props.mode === 'combobox' && typeof props.getInputElement === 'function'
        ? props.getInputElement()
        : null,
    )

    const emptyListContent = computed(() => !props.notFoundContent && props.emptyOptions)

    const [mergedOpen, triggerOpen] = useOpen(
      () => props.open as any,
      nextOpen => props.onPopupVisibleChange?.(nextOpen),
      nextOpen => (props.disabled || emptyListContent.value ? false : nextOpen),
    )

    const tokenWithEnter = computed<boolean>(() =>
      (props.tokenSeparators || []).some(tokenSeparator => ['\n', '\r\n'].includes(tokenSeparator)),
    )

    const onInternalSearch = (searchText: string, fromTyping: boolean, isCompositing: boolean) => {
      const maxCount = props.maxCount
      if (multiple.value && isValidCount(maxCount) && props.displayValues.length >= (maxCount as number)) {
        return
      }
      let ret = true
      let newSearchText = searchText
      props.onActiveValueChange?.(null)

      const separatedList = getSeparatedContent(
        searchText,
        props.tokenSeparators || [],
        isValidCount(props.maxCount) ? props.maxCount! - props.displayValues.length : undefined,
      )

      const patchLabels: string[] = isCompositing ? null : (separatedList as any)

      if (props.mode !== 'combobox' && patchLabels) {
        newSearchText = ''
        props.onSearchSplit?.(patchLabels)
        triggerOpen(false)
        ret = false
      }

      if (props.onSearch && mergedSearchValue.value !== newSearchText) {
        props.onSearch(newSearchText, {
          source: fromTyping ? 'typing' : 'effect',
        })
      }

      if (searchText && fromTyping && ret) {
        triggerOpen(true)
      }

      return ret
    }
    const onInternalSearchSubmit = (searchText: string) => {
      if (!searchText || !searchText.trim()) {
        return
      }
      props.onSearch(searchText, { source: 'submit' })
    }

    watch(
      () => mergedOpen.value,
      (open) => {
        if (!open && !multiple.value && props.mode !== 'combobox') {
          onInternalSearch('', false, false)
        }
      },
    )

    watch(
      () => props.disabled,
      (disabled) => {
        if (disabled) {
          triggerOpen(false)
          focused.value = false
        }
      },
    )

    const [getClearLock, setClearLock] = useLock()
    const keyLockRef = shallowRef(false)

    const onInternalKeyDown = (event: KeyboardEvent) => {
      const clearLock = getClearLock()
      const { key } = event
      const isEnterKey = key === 'Enter'

      if (isEnterKey) {
        if (props.mode !== 'combobox') {
          event.preventDefault()
        }
        if (!mergedOpen.value) {
          triggerOpen(true)
        }
      }

      setClearLock(!!mergedSearchValue.value)

      if (key === 'Backspace' && !clearLock && multiple.value && !mergedSearchValue.value && props.displayValues.length) {
        const cloneDisplayValues = [...props.displayValues]
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
          props.onDisplayValuesChange(cloneDisplayValues, {
            type: 'remove',
            values: [removedDisplayValue],
          })
        }
      }

      if (mergedOpen.value && (!isEnterKey || !keyLockRef.value)) {
        if (isEnterKey) {
          keyLockRef.value = true
        }
        listRef.value?.onKeyDown(event)
      }

      props.onKeyDown?.(event)
    }

    const onInternalKeyUp = (event: KeyboardEvent) => {
      if (mergedOpen.value) {
        listRef.value?.onKeyUp(event as any)
      }
      if (event.key === 'Enter') {
        keyLockRef.value = false
      }
      props.onKeyUp?.(event as any)
    }

    const onSelectorRemove = useEvent((val: DisplayValueType) => {
      const newValues = props.displayValues.filter(i => i !== val)
      props.onDisplayValuesChange(newValues, {
        type: 'remove',
        values: [val],
      })
    })

    const onInputBlur = () => {
      keyLockRef.value = false
    }

    const onInternalFocus = (event: FocusEvent) => {
      focused.value = true
      if (!props.disabled) {
        if ((props.showAction || []).includes('focus')) {
          triggerOpen(true)
        }
        props.onFocus?.(event)
      }
    }

    const onInternalBlur = (event: FocusEvent) => {
      focused.value = false
      if (mergedSearchValue.value) {
        if (props.mode === 'tags') {
          props.onSearch(mergedSearchValue.value, { source: 'submit' })
        }
        else if (props.mode === 'multiple') {
          props.onSearch('', { source: 'blur' })
        }
      }
      if (!props.disabled) {
        triggerOpen(false, { lazy: true })
        props.onBlur?.(event)
      }
    }

    const onInternalMouseDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      const popupElement = triggerRef.value?.getPopupElement() as HTMLDivElement | undefined
      if (popupElement?.contains(target) && triggerOpen) {
        triggerOpen(true, { ignoreNext: true })
      }
      props.onMouseDown?.(event as any)
    }

    const onPopupMouseEnter = () => {}

    // 使用 computed 保持响应式
    const onTriggerVisibleChange = computed(() => {
      if (mergedComponents.value.root) {
        return (newOpen: boolean) => {
          triggerOpen(newOpen)
        }
      }
      return null
    })

    useSelectTriggerControl(
      () => [containerRef.value?.nativeElement, triggerRef.value?.getPopupElement?.()],
      () => !!mergedOpen.value,
      triggerOpen,
      () => !!mergedComponents.value.root,
    )

    const baseSelectContext = computed(() => ({
      ...(props as any),
      notFoundContent: props.notFoundContent ?? 'Not Found',
      open: mergedOpen.value,
      triggerOpen: mergedOpen.value,
      id: props.id,
      showSearch: props.showSearch,
      multiple: multiple.value,
      toggleOpen: triggerOpen,
      showScrollBar: props.showScrollBar,
      styles: props.styles,
      classNames: props.classNames,
    }))

    useProvideBaseSelectContext(baseSelectContext as any)

    const mergedSuffixIcon = computed(() => {
      const nextSuffix: any = props.suffix ?? props.suffixIcon
      if (typeof nextSuffix === 'function') {
        return nextSuffix({
          searchValue: mergedSearchValue.value,
          open: mergedOpen.value,
          focused: focused.value,
          showSearch: props.showSearch,
          loading: props.loading,
        })
      }
      return nextSuffix
    })

    const onClearMouseDown = () => {
      props.onClear?.()
      containerRef.value?.focus()
      props.onDisplayValuesChange([], {
        type: 'clear',
        values: props.displayValues,
      })
      onInternalSearch('', false, false)
    }

    const allowClearConfig = useAllowClear(
      props.prefixCls,
      computed(() => props.displayValues),
      props.allowClear,
      props.clearIcon,
      computed(() => !!props.disabled),
      mergedSearchValue,
      computed(() => props.mode as Mode),
    )

    const mergedAllowClear = computed(() => allowClearConfig.value.allowClear)
    const clearNode = computed(() => allowClearConfig.value.clearIcon)

    const OptionList = props.OptionList
    const optionList = <OptionList ref={listRef as any} />

    const mergedClassName = computed(() =>
      clsx(props.prefixCls, props.className, {
        [`${props.prefixCls}-focused`]: focused.value,
        [`${props.prefixCls}-multiple`]: multiple.value,
        [`${props.prefixCls}-single`]: !multiple.value,
        [`${props.prefixCls}-allow-clear`]: mergedAllowClear.value,
        [`${props.prefixCls}-show-arrow`]:
        mergedSuffixIcon.value !== undefined && mergedSuffixIcon.value !== null,
        [`${props.prefixCls}-disabled`]: props.disabled,
        [`${props.prefixCls}-loading`]: props.loading,
        [`${props.prefixCls}-open`]: mergedOpen.value,
        [`${props.prefixCls}-customize-input`]: customizeInputElement.value,
        [`${props.prefixCls}-show-search`]: props.showSearch,
      }),
    )

    return () => {
      const domAttrs = omit(attrs, props.omitDomProps || []) as any
      let renderNode = (
        <SelectInput
          {...domAttrs}
          ref={containerRef}
          prefixCls={props.prefixCls}
          className={mergedClassName.value}
          focused={focused.value}
          prefix={props.prefix}
          suffix={mergedSuffixIcon.value}
          clearIcon={clearNode.value}
          multiple={multiple.value}
          mode={props.mode as Mode}
          displayValues={props.displayValues}
          placeholder={props.placeholder}
          searchValue={mergedSearchValue.value}
          activeValue={props.activeValue}
          onSearch={onInternalSearch}
          onSearchSubmit={onInternalSearchSubmit}
          onInputBlur={onInputBlur}
          onFocus={onInternalFocus}
          onBlur={onInternalBlur}
          onClearMouseDown={onClearMouseDown}
          onKeyDown={onInternalKeyDown}
          onKeyUp={onInternalKeyUp}
          onSelectorRemove={onSelectorRemove}
          tokenWithEnter={tokenWithEnter.value}
          onMouseDown={onInternalMouseDown}
          components={mergedComponents.value}
        />
      )

      renderNode = (
        <SelectTrigger
          ref={triggerRef as any}
          disabled={!!props.disabled}
          prefixCls={props.prefixCls}
          visible={mergedOpen.value}
          popupElement={optionList}
          animation={props.animation}
          transitionName={props.transitionName}
          popupStyle={props.popupStyle}
          popupClassName={props.popupClassName}
          direction={props.direction}
          popupMatchSelectWidth={props.popupMatchSelectWidth}
          popupRender={props.popupRender}
          popupAlign={props.popupAlign}
          placement={props.placement}
          builtinPlacements={props.builtinPlacements}
          getPopupContainer={props.getPopupContainer}
          empty={props.emptyOptions}
          onPopupVisibleChange={onTriggerVisibleChange.value || undefined}
          onPopupMouseEnter={onPopupMouseEnter}
          onPopupMouseDown={onInternalMouseDown as any}
        >
          {renderNode}
        </SelectTrigger>
      )

      return (
        <>
          <Polite visible={focused.value && !mergedOpen.value} values={props.displayValues} />
          {renderNode}
        </>
      )
    }
  },
)

export default BaseSelect
