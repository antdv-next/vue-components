import type { RefOptionListProps } from '@v-c/select'
import type { ScrollTo } from '@v-c/tree'
import type { Key } from './interface'
import { useBaseProps } from '@v-c/select'
import { defineComponent } from 'vue'

const HIDDEN_STYLE = {
  width: 0,
  height: 0,
  display: 'flex',
  overflow: 'hidden',
  opacity: 0,
  border: 0,
  padding: 0,
  margin: 0,
}

interface TreeEventInfo {
  node: { key: Key }
  selected?: boolean
  checked?: boolean
}

type ReviseRefOptionListProps = Omit<RefOptionListProps, 'scrollTo'> & { scrollTo: ScrollTo }

const OptionList = defineComponent<ReviseRefOptionListProps>(
  (props, { slots, expose, attrs }) => {
    const baseProps = useBaseProps()
    return () => {
      return null
    }
  },
  {
    name: 'OptionList',
    inheritAttrs: false,
  },
)

export default OptionList
