import type { RefOptionListProps } from '@v-c/select'
import { useBaseProps } from '@v-c/select'
import { defineComponent, shallowRef } from 'vue'
import RawOptionList from './List'

const OptionList = defineComponent((_, { expose }) => {
  const baseProps = useBaseProps()
  const listRef = shallowRef<RefOptionListProps | null>(null)

  expose({
    onKeyDown: (event: KeyboardEvent) => listRef.value?.onKeyDown(event),
    onKeyUp: (event: KeyboardEvent) => listRef.value?.onKeyUp(event),
  })

  return () => (
    <RawOptionList
      {...(baseProps.value || {}) as any}
      ref={(el: any) => {
        listRef.value = el
      }}
    />
  )
})

export default OptionList
