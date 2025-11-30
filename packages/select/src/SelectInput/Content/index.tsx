import pickAttrs from '@v-c/util/dist/pickAttrs'
import { defineComponent } from 'vue'
import useBaseProps from '../../hooks/useBaseProps'
import { useSelectInputContext } from '../context'
import MultipleContent from './MultipleContent'
import SingleContent from './SingleContent'

export interface SharedContentProps {
  inputProps: any
}

const SelectContent = defineComponent(
  (_props, { attrs }) => {
    const ctx = useSelectInputContext()
    const baseProps = useBaseProps()

    return () => {
      const { multiple, onInputKeyDown, tabIndex } = ctx.value || {}
      const { showSearch } = baseProps.value || {}

      const ariaProps = pickAttrs(baseProps.value || {}, { aria: true })

      const sharedInputProps = {
        ...ariaProps,
        onKeyDown: onInputKeyDown,
        readOnly: !showSearch,
        tabIndex,
        ...attrs,
      }
      return multiple
        ? (
            <MultipleContent inputProps={sharedInputProps} />
          )
        : (
            <SingleContent inputProps={sharedInputProps} />
          )
    }
  },
)

export default SelectContent
