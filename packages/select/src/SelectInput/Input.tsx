import { clsx } from '@v-c/util'
import { cloneVNode, computed, defineComponent, isVNode, shallowRef } from 'vue'
import { useSelectInputContext } from './context'
import { useLayoutEffect } from '@v-c/util/dist/hooks/useLayoutEffect'
import useBaseProps from '../hooks/useBaseProps'

export interface InputProps {
  id?: string
  readOnly?: boolean
  value?: string
  onInput?: (event: Event) => void
  onKeyDown?: (event: KeyboardEvent) => void
  onFocus?: (event: FocusEvent) => void
  onBlur?: (event: FocusEvent) => void
  placeholder?: string
  className?: string
  style?: any
  maxLength?: number
  syncWidth?: boolean
  autoComplete?: string
}

const Input = defineComponent<InputProps>((props, { expose }) => {
  const selectContext = useSelectInputContext()
  const {
    prefixCls,
    mode,
    onSearch,
    onSearchSubmit,
    onInputBlur,
    autoFocus,
    tokenWithEnter,
    placeholder,
  } = selectContext.value || {}
  const InputComponent = (selectContext.value as any)?.components?.input || 'input'
  const baseProps = useBaseProps()
  const { id, classNames, styles, open, activeDescendantId, role, disabled } = baseProps.value || {}

  const inputCls = clsx(`${prefixCls}-input`, classNames?.input, props.className)

  const compositionStatusRef = shallowRef<boolean>(false)
  const pastedTextRef = shallowRef<string | null>(null)

  const inputRef = shallowRef<HTMLInputElement>()
  expose({
    focus: (options?: FocusOptions) => inputRef.value?.focus(options),
    blur: () => inputRef.value?.blur(),
    nativeElement: inputRef.value as any,
  })

  const handleInput = (event: Event) => {
    const target = event.target as HTMLInputElement
    let nextVal = target?.value ?? ''
    if (tokenWithEnter && pastedTextRef.value && /[\r\n]/.test(pastedTextRef.value)) {
      const replacedText = pastedTextRef.value
        .replace(/[\r\n]+$/, '')
        .replace(/\r\n/g, ' ')
        .replace(/[\r\n]/g, ' ')
      nextVal = nextVal.replace(replacedText, pastedTextRef.value)
    }
    pastedTextRef.value = null
    if (onSearch) {
      onSearch(nextVal, true, compositionStatusRef.value)
    }
    props.onInput?.(event)
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    const { key } = event
    const nextVal = (event.currentTarget as HTMLInputElement)?.value
    if (key === 'Enter' && mode === 'tags' && !compositionStatusRef.value && onSearchSubmit) {
      onSearchSubmit(nextVal)
    }
    props.onKeyDown?.(event)
  }

  const handleBlur = (event: FocusEvent) => {
    onInputBlur?.()
    props.onBlur?.(event)
  }

  const handleCompositionStart = () => {
    compositionStatusRef.value = true
  }

  const handleCompositionEnd = (event: CompositionEvent) => {
    compositionStatusRef.value = false
    if (mode !== 'combobox') {
      const nextVal = (event.currentTarget as HTMLInputElement)?.value
      onSearch?.(nextVal, true, false)
    }
  }

  const handlePaste = (event: ClipboardEvent) => {
    const pastedValue = event.clipboardData?.getData('text')
    pastedTextRef.value = pastedValue || ''
  }

  const widthCssVar = shallowRef<number>()
  useLayoutEffect(() => {
    const input = inputRef.value
    if (props.syncWidth && input) {
      input.style.width = '0px'
      const scrollWidth = input.scrollWidth
      widthCssVar.value = scrollWidth
      input.style.width = ''
    }
  }, [() => props.syncWidth, () => props.value])

  const sharedInputProps = computed(() => ({
    id,
    type: mode === 'combobox' ? 'text' : 'search',
    ...props,
    ref: inputRef,
    style: {
      ...styles?.input,
      ...props.style,
      '--select-input-width': widthCssVar.value as any,
    },
    autoFocus,
    autoComplete: props.autoComplete || 'off',
    class: inputCls,
    disabled,
    value: props.value || '',
    onInput: handleInput,
    onKeydown: handleKeyDown,
    onBlur: handleBlur,
    onPaste: handlePaste,
    onCompositionstart: handleCompositionStart,
    onCompositionend: handleCompositionEnd,
    role: role || 'combobox',
    'aria-expanded': open || false,
    'aria-haspopup': 'listbox',
    'aria-owns': `${id}_list`,
    'aria-autocomplete': 'list',
    'aria-controls': `${id}_list`,
    'aria-activedescendant': open ? activeDescendantId : undefined,
    placeholder: props.placeholder || placeholder,
  }))

  return () => {
    if (isVNode(InputComponent)) {
      const existingProps: any = (InputComponent as any).props || {}
      const mergedProps: any = { ...sharedInputProps.value, ...existingProps }
      Object.keys(existingProps).forEach((key) => {
        const existingValue = existingProps[key]
        if (typeof existingValue === 'function') {
          mergedProps[key] = (...args: any[]) => {
            existingValue(...args)
            ;(sharedInputProps.value as any)[key]?.(...args)
          }
        }
      })
      mergedProps.ref = (InputComponent as any).ref || sharedInputProps.value.ref
      return cloneVNode(InputComponent as any, mergedProps)
    }

    const Component = InputComponent as any
    return <Component {...(sharedInputProps.value as any)} />
  }
})

export default Input
