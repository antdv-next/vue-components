import { clsx } from '@v-c/util'
import { useLayoutEffect } from '@v-c/util/dist/hooks/useLayoutEffect'
import { cloneVNode, computed, defineComponent, isVNode, shallowRef } from 'vue'
import useBaseProps from '../hooks/useBaseProps'
import { useSelectInputContext } from './context'

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

const Input = defineComponent<InputProps>(
  (props, { expose }) => {
    const selectContext = useSelectInputContext()
    const baseProps = useBaseProps()

    // 从 selectContext 中获取响应式值
    const prefixCls = computed(() => selectContext.value?.prefixCls)
    const mode = computed(() => selectContext.value?.mode)
    const onSearch = computed(() => selectContext.value?.onSearch)
    const onSearchSubmit = computed(() => selectContext.value?.onSearchSubmit)
    const onInputBlur = computed(() => selectContext.value?.onInputBlur)
    const autoFocus = computed(() => selectContext.value?.autoFocus)
    const tokenWithEnter = computed(() => selectContext.value?.tokenWithEnter)
    const placeholder = computed(() => selectContext.value?.placeholder)

    // 从 baseProps 中获取响应式值
    const id = computed(() => baseProps.value?.id)
    const classNames = computed(() => baseProps.value?.classNames)
    const styles = computed(() => baseProps.value?.styles)
    const open = computed(() => baseProps.value?.open)
    const activeDescendantId = computed(() => baseProps.value?.activeDescendantId)
    const role = computed(() => baseProps.value?.role)
    const disabled = computed(() => baseProps.value?.disabled)

    const inputCls = computed(() => clsx(`${prefixCls.value}-input`, classNames.value?.input, props.className))

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
      if (tokenWithEnter.value && pastedTextRef.value && /[\r\n]/.test(pastedTextRef.value)) {
        const replacedText = pastedTextRef.value
          .replace(/[\r\n]+$/, '')
          .replace(/\r\n/g, ' ')
          .replace(/[\r\n]/g, ' ')
        nextVal = nextVal.replace(replacedText, pastedTextRef.value)
      }
      pastedTextRef.value = null
      if (onSearch.value) {
        onSearch.value(nextVal, true, compositionStatusRef.value)
      }
      props.onInput?.(event)
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      const { key } = event
      const nextVal = (event.currentTarget as HTMLInputElement)?.value
      if (key === 'Enter' && mode.value === 'tags' && !compositionStatusRef.value && onSearchSubmit.value) {
        onSearchSubmit.value(nextVal)
      }
      props.onKeyDown?.(event)
    }

    const handleBlur = (event: FocusEvent) => {
      onInputBlur.value?.()
      props.onBlur?.(event)
    }

    const handleCompositionStart = () => {
      compositionStatusRef.value = true
    }

    const handleCompositionEnd = (event: CompositionEvent) => {
      compositionStatusRef.value = false
      if (mode.value !== 'combobox') {
        const nextVal = (event.currentTarget as HTMLInputElement)?.value
        onSearch.value?.(nextVal, true, false)
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
      'id': id.value,
      'type': mode.value === 'combobox' ? 'text' : 'search',
      ...props,
      'ref': inputRef,
      'style': {
        ...styles.value?.input,
        ...props.style,
        '--select-input-width': `${widthCssVar.value}px`,
      },
      'autoFocus': autoFocus.value,
      'autoComplete': props.autoComplete || 'off',
      'class': inputCls.value,
      'disabled': disabled.value,
      'value': props.value || '',
      'onInput': handleInput,
      'onKeydown': handleKeyDown,
      'onBlur': handleBlur,
      'onPaste': handlePaste,
      'onCompositionstart': handleCompositionStart,
      'onCompositionend': handleCompositionEnd,
      'role': role.value || 'combobox',
      'aria-expanded': open.value || false,
      'aria-haspopup': 'listbox',
      'aria-owns': `${id.value}_list`,
      'aria-autocomplete': 'list',
      'aria-controls': `${id.value}_list`,
      'aria-activedescendant': open.value ? activeDescendantId.value : undefined,
      'placeholder': props.placeholder || placeholder.value,
    }))

    return () => {
      const InputComponent = (selectContext.value as any)?.components?.input || 'input'
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
      return <Component {...(sharedInputProps as any)} />
    }
  },
)

export default Input
