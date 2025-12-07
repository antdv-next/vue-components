import type { Ref } from 'vue'
import type { SharedConfig } from '../interface'
import { computed } from 'vue'
import Item from '../Item'

export default function useChildren(
  list: Ref<any[]>,
  startIndex: Ref<number>,
  endIndex: Ref<number>,
  scrollWidth: Ref<number>,
  offsetX: Ref<number>,
  setNodeRef: (item: any, element: HTMLElement | null) => void,
  renderFunc: any,
  { getKey }: SharedConfig<any>,
) {
  return computed(() => {
    return list.value.slice(startIndex.value, endIndex.value + 1).map((item, index) => {
      const eleIndex = startIndex.value + index
      const node = renderFunc(item, eleIndex, {
        style: {
          width: `${scrollWidth.value}px`,
        },
        offsetX: offsetX.value,
      })

      const key = getKey(item)
      return (
        <Item key={key} setRef={ele => setNodeRef(item, ele)}>
          {node}
        </Item>
      )
    })
  })
}
