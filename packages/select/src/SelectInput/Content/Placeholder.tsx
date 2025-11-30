import { clsx } from '@v-c/util'
import { computed, defineComponent } from 'vue'
import useBaseProps from '../../hooks/useBaseProps'
import { useSelectInputContext } from '../context'

export interface PlaceholderProps {
  show?: boolean
}

export default defineComponent<PlaceholderProps>((props) => {
  const selectInputContext = useSelectInputContext()
  const baseProps = useBaseProps()

  // 从 selectInputContext 中获取响应式值
  const prefixCls = computed(() => selectInputContext.value?.prefixCls)
  const placeholder = computed(() => selectInputContext.value?.placeholder)
  const displayValues = computed(() => selectInputContext.value?.displayValues)

  // 从 baseProps 中获取响应式值
  const classNames = computed(() => baseProps.value?.classNames)
  const styles = computed(() => baseProps.value?.styles)

  return () => {
    const { show = true } = props

    if (displayValues.value?.length) {
      return null
    }
    return (
      <div
        class={clsx(`${prefixCls.value}-placeholder`, classNames.value?.placeholder)}
        style={{
          visibility: show ? 'visible' : 'hidden',
          ...styles.value?.placeholder,
        }}
      >
        {placeholder.value}
      </div>
    )
  }
})
