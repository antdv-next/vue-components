import type { ListRef } from '@v-c/virtual-list'
import type { ListyProps } from './interface'
import { computed, defineComponent, ref } from 'vue'
import RawList from './RawList'
import VirtualList from './VirtualList'

export default defineComponent<ListyProps>((props, { expose }) => {
  const data = computed(() => props.items || [])

  const listRef = ref<ListRef | null>(null)

  expose({
    scrollTo: (config?: any) => {
      listRef.value?.scrollTo(config)
    },
  })
  return () => {
    const {
      items,
      itemRender,
      virtual = true,
      prefixCls = 'vc-listy',
      ...restProps
    } = props
    // ============================== Render ===============================
    const sharedListProps = {
      ...restProps,
      itemRender: itemRender!,
      data: data.value,
      prefixCls,
    }
    const listNode = virtual
      ? (
          <VirtualList ref={listRef} {...sharedListProps} />
        )
      : (
          <RawList ref={listRef} {...sharedListProps} />
        )
    return listNode
  }
})
