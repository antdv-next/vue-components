import pickAttrs from '@v-c/util/dist/pickAttrs'
import { computed, defineComponent } from 'vue'
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

    const multiple = computed(() => ctx.value?.multiple)
    const onInputKeyDown = computed(() => ctx.value?.onInputKeyDown)
    const tabIndex = computed(() => ctx.value?.tabIndex)
    const showSearch = computed(() => baseProps.value?.showSearch)
    const ariaProps = computed(() => pickAttrs(baseProps.value || {}, { aria: true }))

    const sharedInputProps = computed(() => ({
      ...ariaProps.value,
      onKeyDown: onInputKeyDown.value,
      readOnly: !showSearch.value,
      tabIndex: tabIndex.value,
      ...attrs,
    }))

    return () => {
      return multiple.value
        ? (
            <MultipleContent inputProps={sharedInputProps.value} />
          )
        : (
            <SingleContent inputProps={sharedInputProps.value} />
          )
    }
  },
)

export default SelectContent
