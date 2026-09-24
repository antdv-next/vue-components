import { classNames } from '@v-c/util'
import useMergedState from '@v-c/util/dist/hooks/useMergedState'
import { computed, defineComponent, onMounted, shallowRef } from 'vue'

export interface InputHTMLAttributesType {
  checked?: boolean
  defaultChecked?: boolean
  disabled?: boolean
  type?: string
  title?: string
  onChange?: (e: Event) => void
  value?: any
}

export interface CheckboxChangeEvent {
  target: CheckboxChangeEventTarget
  stopPropagation: () => void
  preventDefault: () => void
  nativeEvent: any
}

export interface CheckboxChangeEventTarget extends CheckboxProps {
  checked: boolean
}

export interface CheckBoxInstance {
  focus: () => void
  blur: () => void
  input: HTMLInputElement | null
  nativeElement: HTMLSpanElement | null
}

export interface CheckboxProps extends Omit<InputHTMLAttributesType, 'onChange'> {
  'prefixCls'?: string
  'onChange'?: (e: CheckboxChangeEvent) => void
  'onUpdate:checked'?: (value: boolean) => void
  'autoFocus'?: boolean
  'id'?: string
  'name'?: string
  'readOnly'?: boolean
  'required'?: boolean
  'tabIndex'?: number
  'onFocus'?: (e: FocusEvent) => void
  'onBlur'?: (e: FocusEvent) => void
}

export const Checkbox = defineComponent<
  CheckboxProps
>(
  (props, { expose, attrs }) => {
    const inputRef = shallowRef<HTMLInputElement>()
    const holderRef = shallowRef<HTMLSpanElement>()
    const [rawValue, setRawValue] = useMergedState(props.defaultChecked, {
      value: computed(() => props.checked),
    })

    expose({
      focus: () => {
        inputRef.value?.focus()
      },
      blur: () => {
        inputRef.value?.blur()
      },
      input: inputRef,
      nativeElement: holderRef,
    })

    onMounted(() => {
      if (props.autoFocus)
        inputRef.value?.focus()
    })

    const handleChange = (e: any) => {
      if (props.disabled)
        return

      if (props.checked === undefined)
        setRawValue(e.target?.checked)

      props?.['onUpdate:checked']?.(e.target.checked)
      props?.onChange?.({
        target: {
          ...attrs,
          ...props,
          checked: e.target.checked,
        },
        stopPropagation() {
          e.stopPropagation()
        },
        preventDefault() {
          e.preventDefault()
        },
        nativeEvent: e,
      })
    }

    return () => {
      const {
        checked: _checked,
        defaultChecked: _defaultChecked,
        disabled,
        type = 'checkbox',
        title,
        prefixCls = 'vc-checkbox',
        onChange: _onChange,
        value,
        'onUpdate:checked': _onUpdateChecked,
        ...inputProps
      } = props
      const { class: className, style, ...attrInputProps } = attrs as any
      const classString = classNames(prefixCls, className, {
        [`${prefixCls}-checked`]: rawValue.value,
        [`${prefixCls}-disabled`]: disabled,
      })
      return (
        <span class={classString} ref={holderRef} title={title} style={[style]}>
          <input
            {...inputProps}
            {...attrInputProps}
            {...(value !== undefined ? { value } : {})}
            class={`${prefixCls}-input`}
            ref={inputRef}
            onChange={e => handleChange(e)}
            disabled={disabled}
            checked={!!rawValue.value}
            type={type}
          />
        </span>
      )
    }
  },
  { inheritAttrs: false },
)

export default Checkbox
