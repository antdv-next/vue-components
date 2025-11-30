import { clsx } from '@v-c/util'
import { defineComponent } from 'vue'
import useBaseProps from '../../hooks/useBaseProps'
import { useSelectInputContext } from '../context'

export interface PlaceholderProps {
  show?: boolean
}

export default defineComponent<PlaceholderProps>((props) => {
  const selectInputContext = useSelectInputContext()
  const baseProps = useBaseProps()

  return () => {
    const { prefixCls, placeholder, displayValues } = selectInputContext.value || {}
    const { classNames, styles } = baseProps.value || {}
    const { show = true } = props

    if (displayValues?.length) {
      return null
    }
    return (
      <div
        class={clsx(`${prefixCls}-placeholder`, classNames?.placeholder)}
        style={{
          visibility: show ? 'visible' : 'hidden',
          ...styles?.placeholder,
        }}
      >
        {placeholder}
      </div>
    )
  }
})
