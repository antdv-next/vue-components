import type { Ref } from 'vue'
import { classNames } from '@v-c/util'
import useMergedState from '@v-c/util/dist/hooks/useMergedState'
import { computed, defineComponent, shallowRef } from 'vue'

export interface InputHTMLAttributesType {
  checked?: boolean
  defaultChecked?: boolean
  disabled?: boolean
  type?: string
  title?: string
  onChange?: (e: Event) => void
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
  input: Ref<HTMLInputElement | null>
}

export interface CheckboxProps extends Omit<InputHTMLAttributesType, 'onChange'> {
  'prefixCls'?: string
  'onChange'?: (e: CheckboxChangeEvent) => void
  'onUpdate:checked'?: (value: boolean) => void
}

export const Checkbox = defineComponent<CheckboxProps>((props, { expose, attrs }) => {
  const inputRef = shallowRef<HTMLInputElement>()
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
  })

  const handleChange = (e: any) => {
    if (props.disabled)
      return

    if (!('checked' in props))
      setRawValue(e.target?.checked)

    props?.['onUpdate:checked']?.(e.target.checked)
    props?.onChange?.({
      target: {
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
      prefixCls = 'vc-checkbox',
      disabled,
      type = 'checkbox',
      title,

    } = props
    const classString = classNames(prefixCls, attrs.class as any, {
      [`${prefixCls}-checked`]: rawValue.value,
      [`${prefixCls}-disabled`]: disabled,
    })
    return (
      <span class={classString} title={title} style={[(attrs as any).style]}>
        <input
          class={`${prefixCls}-input`}
          ref={inputRef}
          onChange={e => handleChange(e)}
          disabled={disabled}
          checked={!!rawValue.value}
          type={type}
        />
        <span class={`${prefixCls}-inner`} />
      </span>
    )
  }
})

export default Checkbox
