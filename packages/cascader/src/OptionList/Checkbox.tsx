import type { VueNode } from '@v-c/util'
import { clsx } from '@v-c/util'
import { defineComponent } from 'vue'
import { useCascaderContext } from '../context'

export interface CheckboxProps {
  prefixCls: string
  checked?: boolean
  halfChecked?: boolean
  disabled?: boolean
  onClick?: (event: MouseEvent) => void
  disableCheckbox?: boolean
  children?: VueNode
}

const checkboxDefaults: CheckboxProps = {
  prefixCls: '',
  checked: false,
  halfChecked: false,
  disabled: false,
  disableCheckbox: false,
}

const Checkbox = defineComponent<CheckboxProps>((props = checkboxDefaults) => {
  const context = useCascaderContext()

  return () => {
    const checkable = context.value?.checkable
    const customCheckbox = typeof checkable !== 'boolean' ? checkable : null

    return (
      <span
        class={clsx(`${props.prefixCls}`, {
          [`${props.prefixCls}-checked`]: props.checked,
          [`${props.prefixCls}-indeterminate`]: !props.checked && props.halfChecked,
          [`${props.prefixCls}-disabled`]: props.disabled || props.disableCheckbox,
        })}
        onClick={props.onClick}
      >
        {customCheckbox}
      </span>
    )
  }
})

export default Checkbox
