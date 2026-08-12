import type { VueNode } from '@v-c/util/dist/type'
import type { CSSProperties, VNode } from 'vue'
import type { ComponentsConfig } from '../hooks'
import type { DisplayValueType, Mode, RenderNode } from '../interface'
import type { InputRef } from './Input.tsx'
import { clsx } from '@v-c/util'
import { getDOM } from '@v-c/util/dist/Dom/findDOMNode'
import KeyCode, { KeyCodeStr } from '@v-c/util/dist/KeyCode'
import omit from '@v-c/util/dist/omit'
import { cloneVNode, computed, defineComponent, isVNode, shallowRef } from 'vue'
import useBaseProps from '../hooks/useBaseProps'
import { isValidateOpenKey } from '../utils/keyUtil'
import Affix from './Affix'
import SelectContent from './Content'
import { useSelectInputProvider } from './context'

export interface SelectInputRef {
  focus: (options?: FocusOptions) => void
  blur: () => void
  nativeElement: HTMLDivElement
}

export interface SelectInputProps {
  prefixCls: string
  prefix?: VueNode
  suffix?: VueNode
  clearIcon?: VueNode
  clearLabel?: string
  removeIcon?: RenderNode
  multiple?: boolean
  displayValues: DisplayValueType[]
  placeholder?: VueNode
  searchValue?: string
  activeValue?: string
  mode?: Mode
  autoClearSearchValue?: boolean
  onSearch?: (searchText: string, fromTyping: boolean, isCompositing: boolean) => void
  onSearchSubmit?: (searchText: string) => void
  onInputBlur?: () => void
  onClearMouseDown?: (event: MouseEvent) => void
  onInputKeyDown?: (event: KeyboardEvent) => void
  onSelectorRemove?: (value: DisplayValueType) => void
  maxLength?: number
  autoFocus?: boolean
  /** Check if `tokenSeparators` contains `\n` or `\r\n` */
  tokenWithEnter?: boolean
  // Add other props that need to be passed through
  className?: string
  style?: CSSProperties
  focused?: boolean
  components: ComponentsConfig
  // Events
  onFocus?: (event: FocusEvent) => void
  onBlur?: (event: FocusEvent) => void
  onKeyDown?: (event: KeyboardEvent) => void
  onKeyUp?: (event: KeyboardEvent) => void
  onMouseDown?: (event: MouseEvent) => void
}

const DEFAULT_OMIT_PROPS = [
  'value',
  'onChange',
  'removeIcon',
  'placeholder',
  'maxTagCount',
  'maxTagTextLength',
  'maxTagPlaceholder',
  'choiceTransitionName',
  'onInputKeyDown',
  'onPopupScroll',
  'tabIndex',
  'activeValue',
  'onSelectorRemove',
  'focused',
] as const

function mergeVNodeProps(originProps: Record<string, any>, nextProps: Record<string, any>) {
  const mergedProps = { ...originProps, ...nextProps }

  Object.keys(originProps).forEach((key) => {
    const originVal = originProps[key]
    const nextVal = nextProps[key]

    if (typeof originVal === 'function' && typeof nextVal === 'function') {
      mergedProps[key] = (...args: any[]) => {
        nextVal(...args)
        originVal(...args)
      }
    }
  })

  return mergedProps
}

const SelectInput = defineComponent<SelectInputProps>(
  (props, { attrs, expose, slots }) => {
    const baseProps = useBaseProps()

    const rootRef = shallowRef<HTMLDivElement>()
    const inputRef = shallowRef<InputRef>()

    // ===================== Computed Values ======================
    const prefixCls = computed(() => props.prefixCls)
    const className = computed(() => props.className)
    const style = computed(() => props.style)
    const prefix = computed(() => props.prefix)
    const suffix = computed(() => props.suffix)
    const clearIcon = computed(() => props.clearIcon)
    const clearLabel = computed(() => props.clearLabel)
    const multiple = computed(() => props.multiple)
    const mode = computed(() => props.mode)
    const onClearMouseDown = computed(() => props.onClearMouseDown)
    const onInputKeyDown = computed(() => props.onInputKeyDown)
    const components = computed(() => props.components)

    const triggerOpen = computed(() => baseProps.value?.triggerOpen ?? false)
    const toggleOpen = computed(() => baseProps.value?.toggleOpen)
    const showSearch = computed(() => baseProps.value?.showSearch ?? false)
    const disabled = computed(() => baseProps.value?.disabled ?? false)
    const loading = computed(() => baseProps.value?.loading ?? false)
    const classNamesConfig = computed(() => baseProps.value?.classNames)
    const stylesConfig = computed(() => baseProps.value?.styles)

    // Handle keyboard events similar to original Selector
    const onInternalInputKeyDown = (event: KeyboardEvent) => {
      const { keyCode } = event

      // Vue refs update synchronously (unlike React state which keeps the
      // pre-render value inside the same event). Record the open state before
      // `toggleOpen(true)` below so that `BaseSelect.onInternalKeyDown` (which
      // receives this same bubbled event later) can tell whether the dropdown
      // was open BEFORE this keydown. Otherwise the Enter key that opens the
      // dropdown would immediately be forwarded to OptionList and select the
      // active option, closing the dropdown again.
      // see https://github.com/antdv-next/antdv-next/issues/594
      if ((event as any)._select_open_before === undefined) {
        (event as any)._select_open_before = triggerOpen.value
      }

      // Compatible with multiple lines in TextArea
      const isTextAreaElement = inputRef.value?.input instanceof HTMLTextAreaElement

      // Prevent default behavior for up/down arrows when dropdown is open
      if (!isTextAreaElement && triggerOpen.value && (keyCode === KeyCode.UP || keyCode === KeyCode.DOWN)) {
        event.preventDefault()
      }

      // Call the original onInputKeyDown callback
      if (onInputKeyDown.value) {
        onInputKeyDown.value(event)
      }

      // Move within the text box for TextArea
      if (
        isTextAreaElement
        && !triggerOpen.value
        && [KeyCode.UP, KeyCode.DOWN, KeyCode.LEFT, KeyCode.RIGHT].includes(keyCode)
      ) {
        return
      }

      // Open dropdown when a valid open key is pressed
      const isModifier = event.ctrlKey || event.altKey || event.metaKey
      if (!isModifier && isValidateOpenKey(keyCode)) {
        toggleOpen.value?.(true)
      }
    }

    // ====================== Refs ======================
    expose({
      focus: (options?: FocusOptions) => {
        // Focus the inner input if available, otherwise fall back to root div.
        (inputRef.value?.input || rootRef.value)?.focus?.(options)
      },
      blur: () => {
        (inputRef.value?.input || rootRef.value)?.blur?.()
      },
      nativeElement: computed(() => getDOM(rootRef.value) as HTMLDivElement | undefined),
    })

    // ====================== Open ======================
    const onInternalMouseDown = (event: MouseEvent) => {
      if (!disabled.value) {
        const inputDOM = getDOM(inputRef.value?.input)

        // https://github.com/ant-design/ant-design/issues/56002
        // Tell `useSelectTriggerControl` to ignore this event
        // When icon is dynamic render, the parentNode will miss
        // so we need to mark the event directly
        ;(event as any)._ori_target = inputDOM

        const isClickOnInput = inputDOM === event.target || (inputDOM as HTMLElement | undefined)?.contains(event.target as Node)

        if (inputDOM && !isClickOnInput) {
          event.preventDefault()
        }

        // Check if we should prevent closing when clicking on selector
        // Don't close if: open && not multiple && (combobox mode || showSearch)
        const shouldPreventCloseOnSingle
          = triggerOpen.value && !multiple.value && (mode.value === 'combobox' || showSearch.value)
        const shouldPreventCloseOnMultipleInput = triggerOpen.value && multiple.value && isClickOnInput
        const shouldPreventClose = shouldPreventCloseOnSingle || shouldPreventCloseOnMultipleInput

        if (!(event as any)._select_lazy) {
          inputRef.value?.input?.focus()

          // Only toggle open if we should not prevent close
          if (!shouldPreventClose) {
            toggleOpen.value?.()
          }
        }
        else if (triggerOpen.value && !multiple.value) {
          // Lazy should also close when click clear icon in single select.
          toggleOpen.value?.(false)
        }
      }

      props?.onMouseDown?.(event)
    }

    // ===================== Clear ======================
    // The clear button lives inside the select root, whose `onKeydown` treats
    // Enter/Space as "open the dropdown" and calls `preventDefault` on them.
    // That would cancel the native button activation, so keyboard users would
    // never get the `click` event which performs the clear. Keep the activation
    // keys scoped to the button itself.
    const onClearKeydown = (event: KeyboardEvent) => {
      if (event.key === KeyCodeStr.Enter || event.key === KeyCodeStr.Space) {
        event.stopPropagation()
      }
    }

    // =================== Context ===================
    // Create context value with wrapped callbacks
    const contextValue = computed(() => ({
      ...props,
      onInputKeyDown: onInternalInputKeyDown,
    }))

    useSelectInputProvider(contextValue)

    return () => {
      // =================== Components ===================
      const RootComponent = components.value?.root

      // ===================== Render =====================
      const domProps = omit({
        ...attrs,
        onFocus: props.onFocus,
        onBlur: props.onBlur,
        onFocusin: props.onFocus,
        onFocusout: props.onBlur,
        onKeydown: props.onKeyDown,
        onKeyup: props.onKeyUp,
        onMousedown: props.onMouseDown,
      } as any, DEFAULT_OMIT_PROPS as any)

      if (RootComponent) {
        const originProps = (RootComponent as any).props || {}
        const mergedProps = mergeVNodeProps(originProps, domProps)

        if (isVNode(RootComponent)) {
          return cloneVNode(RootComponent as VNode, {
            ...mergedProps,
            ref: rootRef,
          })
        }

        const Component = RootComponent as any
        return <Component {...mergedProps} ref={rootRef} />
      }

      // `domProps` already carries the focus/keyboard/mouse handlers for the
      // custom root component branch above. They MUST be excluded here since
      // Vue's `mergeProps` would merge a spread handler and an explicit one
      // into an array, invoking the same handler twice per event.
      // see https://github.com/antdv-next/antdv-next/issues/594
      const divProps = omit(domProps as any, [
        'onFocus',
        'onBlur',
        'onFocusin',
        'onFocusout',
        'onKeydown',
        'onKeyup',
        'onMousedown',
      ])

      return (
        <div
          {...divProps}
          // Style
          ref={rootRef}
          class={className.value}
          style={style.value}
          // Mouse Events
          onMousedown={onInternalMouseDown}
          // Keyboard & Focus Events
          onKeydown={props.onKeyDown}
          onKeyup={props.onKeyUp}
          onFocusin={props.onFocus}
          onFocusout={props.onBlur}
        >
          {/* Prefix */}
          <Affix class={clsx(`${prefixCls.value}-prefix`, classNamesConfig.value?.prefix)} style={stylesConfig.value?.prefix}>
            {prefix.value}
          </Affix>

          {/* Content */}
          <SelectContent ref={inputRef} />

          {/* Suffix */}
          <Affix
            class={clsx(
              `${prefixCls.value}-suffix`,
              {
                [`${prefixCls.value}-suffix-loading`]: loading.value,
              },
              classNamesConfig.value?.suffix,
            )}
            style={stylesConfig.value?.suffix}
          >
            {suffix.value}
          </Affix>

          {/* Clear Icon */}
          {clearIcon.value && (
            <button
              type="button"
              aria-label={clearLabel.value}
              class={clsx(`${prefixCls.value}-clear`, classNamesConfig.value?.clear)}
              style={stylesConfig.value?.clear}
              onMousedown={(e: MouseEvent) => {
                // Keep focus on the input and mark the native event so the root
                // `onInternalMouseDown` handler does not open the dropdown.
                // This must run on mousedown because the root handler fires
                // before the button's onClick.
                e.preventDefault();
                (e as any)._select_lazy = true
              }}
              onKeydown={onClearKeydown}
              // Clearing happens on click so it works for both pointer and
              // keyboard (Enter/Space) activation.
              onClick={(e: MouseEvent) => onClearMouseDown.value?.(e)}
            >
              {clearIcon.value}
            </button>
          )}

          {slots.default?.()}
        </div>
      )
    }
  },
  {
    name: 'SelectInput',
    inheritAttrs: false,
  },
)

export default SelectInput
