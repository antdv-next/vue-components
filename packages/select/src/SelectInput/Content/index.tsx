import type { InputHTMLAttributes } from 'vue'
import pickAttrs from '@v-c/util/dist/pickAttrs'
import { computed, defineComponent, shallowRef } from 'vue'
import useBaseProps from '../../hooks/useBaseProps'
import { useSelectInputContext } from '../context'
import MultipleContent from './MultipleContent'
import SingleContent from './SingleContent'

export interface SharedContentProps {
  inputProps: InputHTMLAttributes
}

const SelectContent = defineComponent(
  (_, { expose }) => {
    const selectInputContext = useSelectInputContext()
    const baseProps = useBaseProps()

    const inputRef = shallowRef<HTMLInputElement>()

    expose({
      input: inputRef,
    })

    const multiple = computed(() => selectInputContext.value?.multiple)
    const onInputKeyDown = computed(() => selectInputContext.value?.onInputKeyDown)
    const showSearch = computed(() => baseProps.value?.showSearch)

    const ariaProps = computed(() => pickAttrs(baseProps.value ?? {}, { aria: true }))

    const sharedInputProps = computed<SharedContentProps['inputProps']>(() => ({
      ...ariaProps.value,
      onKeyDown: onInputKeyDown.value,
      readonly: !showSearch.value,
      tabindex: baseProps.value?.tabIndex,
    }))

    return () => {
      if (multiple.value) {
        return <MultipleContent ref={inputRef} inputProps={sharedInputProps.value} />
      }

      return <SingleContent ref={inputRef} inputProps={sharedInputProps.value} />
    }
  },
  {
    name: 'SelectContent',
    inheritAttrs: false,
  },
)

export default SelectContent
