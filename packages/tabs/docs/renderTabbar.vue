<script lang="ts">
import type { VNode } from 'vue'
import { h } from 'vue'
import DragTabWrapper from './DragTabWrapper.vue'

export function useRenderTabBar(
  onDragStart: (key: string) => void,
  onDrop: (key: string) => void,
  onDragEnd?: () => void,
) {
  return (props: Record<string, any>, DefaultTabBar: any): VNode => {
    return h(DefaultTabBar, {
      ...props,
      children: (node: any) => h(DragTabWrapper, {
        node,
        tabKey: node?.key as string,
        onDragStart,
        onDrop,
        onDragEnd,
      }),
    })
  }
}
</script>
