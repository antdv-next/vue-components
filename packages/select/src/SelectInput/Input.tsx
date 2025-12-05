import { clsx } from '@v-c/util'
import { KeyCodeStr } from '@v-c/util/dist/KeyCode'
import { createVNode, defineComponent, isVNode, nextTick, shallowRef, watch } from 'vue'
import useBaseProps from '../hooks/useBaseProps'
import { useSelectInputContext } from './context'

export interface InputProps {
  id?: string
  readOnly?: boolean
  value?: string
  onChange?: (event: Event) => void
  onKeyDown?: (event: KeyboardEvent) => void
  onFocus?: (event: FocusEvent) => void
  onBlur?: (event: FocusEvent) => void
  placeholder?: string
  className?: string
  style?: Record<string, any>
  maxLength?: number
  /** width always match content width */
  syncWidth?: boolean
  /** autoComplete for input */
  autoComplete?: string
}

export interface InputRef {
  input: HTMLInputElement
}
const Input = defineComponent<InputProps>(
  (props, { expose, attrs }) => {
    const selectInputContext = useSelectInputContext()
    const baseProps = useBaseProps()

    // Used to handle input method composition status
    const compositionStatusRef = shallowRef(false)
    // Used to handle paste content, similar to original Selector implementation
    const pastedTextRef = shallowRef<string | null>(null)

    // ============================== Refs ==============================
    const inputRef = shallowRef<HTMLInputElement>()

    expose({
      input: inputRef,
    })

    // ============================== Data ==============================
    // Handle input changes
    const handleChange = (event: Event) => {
      const { tokenWithEnter, onSearch } = selectInputContext.value ?? {}
      let { value: nextVal } = event.target as any
      // Handle pasted text with tokenWithEnter, similar to original Selector implementation
      if (tokenWithEnter && pastedTextRef.value && /[\r\n]/.test(pastedTextRef.value)) {
        // CRLF will be treated as a single space for input element
        const replacedText = pastedTextRef.value
          .replace(/[\r\n]+$/, '')
          .replace(/\r\n/g, ' ')
          .replace(/[\r\n]/g, ' ')
        nextVal = nextVal.replace(replacedText, pastedTextRef.value)
      }
      // Reset pasted text reference
      pastedTextRef.value = null
      // Call onSearch callback
      if (onSearch) {
        onSearch(nextVal, true, compositionStatusRef.value)
      }
      // Call original onChange callback
      props?.onChange?.(event)
    }

    // ============================ Keyboard ============================
    // Handle keyboard events
    const handleKeyDown = (event: KeyboardEvent) => {
      const { mode, onSearchSubmit } = selectInputContext.value ?? {}
      const { key } = event
      const { value: nextVal } = event.currentTarget as any
      // Handle Enter key submission - referencing Selector implementation

      if (key === KeyCodeStr.Enter && mode === 'tags' && !compositionStatusRef.value && onSearchSubmit) {
        onSearchSubmit(nextVal)
      }
      // Call original onKeyDown callback
      props?.onKeyDown?.(event)
    }

    // Handle blur events
    const handleBlur = (event: FocusEvent) => {
      const { onInputBlur } = selectInputContext.value ?? {}
      // Call onInputBlur callback
      onInputBlur?.()

      // Call original onBlur callback
      props?.onBlur?.(event)
    }

    // Handle input method composition start
    const handleCompositionStart = () => {
      compositionStatusRef.value = true
    }

    // Handle input method composition end
    const handleCompositionEnd = (event: CompositionEvent) => {
      const { mode, onSearch } = selectInputContext.value ?? {}
      compositionStatusRef.value = false
      if (mode !== 'combobox') {
        const { value: nextVal } = event.currentTarget as any
        onSearch?.(nextVal, true, false)
      }
    }

    // Handle paste events to track pasted content

    const handlePaste = (event: ClipboardEvent) => {
      const { clipboardData } = event
      const pastedValue = clipboardData?.getData?.('text')
      pastedTextRef.value = pastedValue || ''
    }

    // ============================= Width ==============================
    const widthCssVar = shallowRef<number>()

    // When syncWidth is enabled, adjust input width based on content
    watch(
      [() => props.syncWidth, () => props.value],
      async () => {
        await nextTick()
        const input = inputRef.value
        if (props.syncWidth && input) {
          input.style.width = '0px'
          const scrollWidth = input.scrollWidth
          widthCssVar.value = scrollWidth
          // Reset input style
          input.style.width = ''
        }
      },
      {
        immediate: true,
      },
    )
    return () => {
      const {
        style,
        autoComplete,
        className,
        value,
      } = props
      const {
        prefixCls,
        mode,
        autoFocus,
        placeholder,
      } = selectInputContext.value ?? {}
      const { input: InputComponent = 'input' } = selectInputContext.value?.components ?? {}
      const {
        styles,
        id,
        classNames,
        open,
        activeDescendantId,
        role,
        disabled,
      } = baseProps.value ?? {}

      const inputCls = clsx(`${prefixCls}-input`, classNames?.input, className)

      // ============================= Render =============================
      // Extract shared input props

      const sharedInputProps = {
        id,
        'type': mode === 'combobox' ? 'text' : 'search',
        ...attrs,
        'ref': inputRef,
        'style': {
          ...styles?.input,
          ...style,
          '--select-input-width': widthCssVar.value,
        },
        autoFocus,
        'autocomplete': autoComplete || 'off',
        'class': inputCls,
        disabled,
        'value': value || '',
        'onInput': handleChange,
        'onKeydown': handleKeyDown,
        'onBlur': handleBlur,
        'onPaste': handlePaste,
        'onCompositionstart': handleCompositionStart,
        'onCompositionend': handleCompositionEnd,
        // Accessibility attributes
        'role': role || 'combobox',
        'aria-expanded': open || false,
        'aria-haspopup': 'listbox',
        'aria-owns': `${id}_list`,
        'aria-autocomplete': 'list',
        'aria-controls': `${id}_list`,
        'aria-activedescendant': open ? activeDescendantId : undefined,
      }
      // Handle different InputComponent types

      if (isVNode(InputComponent)) {
        // If InputComponent is a ReactElement, use cloneElement with merged props
        // const existingProps: any = InputComponent.props || {}

        // Start with shared props as base
        const mergedProps = {
          placeholder: props.placeholder || placeholder,
          ...sharedInputProps,
        }

        return createVNode(InputComponent, mergedProps) as any
      }
      // If InputComponent is a component type, render normally
      const Component = InputComponent as any
      return <Component {...sharedInputProps} />
    }
  },
  {
    name: 'Input',
    inheritAttrs: false,
  },
)

export default Input
