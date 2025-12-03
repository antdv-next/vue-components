import type { DisplayValueType } from '../../interface'
import type { SharedContentProps } from './index'
import { defineComponent } from 'vue'
import useBaseProps from '../../hooks/useBaseProps.ts'
import { useSelectInputContext } from '../context'

function itemKey(value: DisplayValueType) {
  return value.key ?? value.value
}

function onPreventMouseDown(event: MouseEvent) {
  event.preventDefault()
  event.stopPropagation()
}
const MultipleContent = defineComponent<SharedContentProps>(
  (props) => {
    const selectInputContext = useSelectInputContext()
    const baseProps = useBaseProps()

    return () => {
      const { prefixCls } = selectInputContext.value ?? {}
      const selectionItemPrefixCls = `${prefixCls}-selection-item`

      return null
    }
  },
  {
    name: 'MultipleContent',
    inheritAttrs: false,
  },
)

export default MultipleContent
