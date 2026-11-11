import { classNames } from '@v-c/util'
import useMergedState from '@v-c/util/dist/hooks/useMergedState'
import { computed, defineComponent, nextTick, onBeforeUnmount, onMounted, shallowRef } from 'vue'

const inputRestorers = new WeakMap<HTMLInputElement, () => void>()

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

    const restoreChecked = () => {
      if (inputRef.value && props.checked !== undefined)
        inputRef.value.checked = !!props.checked
    }

    const restoreControlledState = () => {
      const input = inputRef.value
      if (!input)
        return

      restoreChecked()
      if (input.type !== 'radio' || !input.name)
        return

      // Native activation also unchecks the previous radio, without firing change.
      // Match the DOM group rather than component ancestry (including form=).
      const root = input.getRootNode() as Document | DocumentFragment | HTMLElement
      root.querySelectorAll<HTMLInputElement>('input[type="radio"]').forEach((other) => {
        if (other !== input && other.name === input.name && other.form === input.form)
          inputRestorers.get(other)?.()
      })
    }

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
      if (inputRef.value)
        inputRestorers.set(inputRef.value, restoreChecked)
      if (props.autoFocus)
        inputRef.value?.focus()
    })

    onBeforeUnmount(() => {
      if (inputRef.value)
        inputRestorers.delete(inputRef.value)
    })

    const handleChange = (e: any) => {
      if (props.disabled)
        return

      const checked = e.target.checked
      if (props.checked === undefined)
        setRawValue(checked)

      try {
        props?.['onUpdate:checked']?.(checked)
        props?.onChange?.({
          target: {
            ...attrs,
            ...props,
            checked,
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
      finally {
        // Vue does not restore controlled inputs when their prop stays unchanged.
        // Wait for parent updates before restoring the latest controlled state.
        nextTick(restoreControlledState)
      }
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
