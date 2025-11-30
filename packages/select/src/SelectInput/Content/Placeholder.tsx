import { clsx } from '@v-c/util'
import { defineComponent } from 'vue'
import { useSelectInputContext } from '../context'
import useBaseProps from '../../hooks/useBaseProps'

export interface PlaceholderProps {
  show?: boolean
}

export default defineComponent<PlaceholderProps>((props) => {
  const { prefixCls, placeholder, displayValues } = useSelectInputContext().value || {}
  const { classNames, styles } = useBaseProps().value || {}
  const { show = true } = props

  return () => {
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
