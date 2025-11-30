import { defineComponent } from 'vue'
import pickAttrs from '@v-c/util/dist/pickAttrs'
import SingleContent from './SingleContent'
import MultipleContent from './MultipleContent'
import { useSelectInputContext } from '../context'
import useBaseProps from '../../hooks/useBaseProps'

export interface SharedContentProps {
  inputProps: any
}

const SelectContent = defineComponent((_props, { attrs, expose }) => {
  const ctx = useSelectInputContext()
  const { multiple, onInputKeyDown, tabIndex } = ctx.value || {}
  const baseProps = useBaseProps()
  const { showSearch } = baseProps.value || {}

  const ariaProps = pickAttrs(baseProps.value || {}, { aria: true })

  const sharedInputProps = {
    ...ariaProps,
    onKeyDown: onInputKeyDown,
    readOnly: !showSearch,
    tabIndex,
    ...attrs,
  }

  expose()

  return () =>
    multiple ? (
      <MultipleContent inputProps={sharedInputProps} />
    ) : (
      <SingleContent inputProps={sharedInputProps} />
    )
})

export default SelectContent
