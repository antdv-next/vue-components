import type { VueNode } from '@v-c/util/dist/type'
import type { CSSProperties, VNode } from 'vue'
import type { ComponentsConfig } from '../hooks/useComponents'
import type { DisplayValueType, Mode, RenderNode } from '../interface'
import { clsx } from '@v-c/util'
import { getDOM } from '@v-c/util/dist/Dom/findDOMNode'
import KeyCode from '@v-c/util/dist/KeyCode'
import omit from '@v-c/util/dist/omit'
import { computed, createVNode, defineComponent, isVNode, shallowRef } from 'vue'
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

const SelectInput = defineComponent<SelectInputProps>(
  (props, { attrs, expose, slots }) => {
    const baseProps = useBaseProps()

    const rootRef = shallowRef<HTMLDivElement>()
    const inputRef = shallowRef<HTMLInputElement>()

    // ===================== Computed Values ======================
    const prefixCls = computed(() => props.prefixCls)
    const className = computed(() => props.className)
    const style = computed(() => props.style)
    const prefix = computed(() => props.prefix)
    const suffix = computed(() => props.suffix)
    const clearIcon = computed(() => props.clearIcon)
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

      // Compatible with multiple lines in TextArea
      const isTextAreaElement = inputRef.value instanceof HTMLTextAreaElement

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
      if (isValidateOpenKey(keyCode)) {
        toggleOpen.value?.(true)
      }
    }

    // ====================== Refs ======================
    expose({
      focus: (options?: FocusOptions) => {
        // Focus the inner input if available, otherwise fall back to root div.
        (inputRef.value || rootRef.value)?.focus?.(options)
      },
      blur: () => {
        (inputRef.value || rootRef.value)?.blur?.()
      },
      nativeElement: rootRef,
    })

    // ====================== Open ======================
    const onInternalMouseDown = (event: MouseEvent) => {
      if (!disabled.value) {
        if (event.target !== getDOM(inputRef)) {
          event.preventDefault()
        }

        // Check if we should prevent closing when clicking on selector
        // Don't close if: open && not multiple && (combobox mode || showSearch)
        const shouldPreventClose = triggerOpen.value && !multiple.value && (mode.value === 'combobox' || showSearch.value)

        if (!(event as any)._select_lazy) {
          inputRef.value?.focus()

          // Only toggle open if we should not prevent close
          if (!shouldPreventClose) {
            toggleOpen.value?.()
          }
        }
        else if (triggerOpen.value) {
          // Lazy should also close when click clear icon
          toggleOpen.value?.(false)
        }
      }

      const onMouseDown = attrs.onMousedown as ((event: MouseEvent) => void) | undefined
      onMouseDown?.(event)
    }

    const onInternalBlur = (event: FocusEvent) => {
      toggleOpen.value?.(false)
      const onBlur = attrs.onBlur as ((event: FocusEvent) => void) | undefined
      onBlur?.(event)
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
      const domProps = omit({ ...attrs } as any, DEFAULT_OMIT_PROPS as any)

      if (RootComponent) {
        if (isVNode(RootComponent)) {
          return createVNode(RootComponent as VNode, {
            ...domProps,
            ref: rootRef,
          })
        }

        const Component = RootComponent as any
        return <Component {...domProps} ref={rootRef} />
      }

      return (
        <div
          {...domProps}
          // Style
          ref={rootRef}
          class={className.value}
          style={style.value}
          // Mouse Events
          onMousedown={onInternalMouseDown}
          onBlur={onInternalBlur}
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
            <Affix
              class={clsx(`${prefixCls.value}-clear`, classNamesConfig.value?.clear)}
              style={stylesConfig.value?.clear}
              onMousedown={(e: MouseEvent) => {
                // Mark to tell not trigger open or focus
                (e as any)._select_lazy = true
                onClearMouseDown.value?.(e)
              }}
            >
              {clearIcon.value}
            </Affix>
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
