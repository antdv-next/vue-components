import type { Ref } from 'vue'
import { ref } from 'vue'

export interface NodeSize {
  width: number
  height: number
}

export type NodeSizeMap = Record<string, NodeSize>

/**
 * Track measured node sizes by key. Returns the size map ref and a setter callback.
 */
export default function useSizes(): [
  Ref<NodeSizeMap>,
  (key: string, node: HTMLElement | null) => void,
] {
  const sizeMap = ref<NodeSizeMap>({})

  function setNodeSize(key: string, node: HTMLElement | null) {
    if (!node) {
      if (!(key in sizeMap.value)) {
        return
      }
      const { [key]: _, ...rest } = sizeMap.value
      sizeMap.value = rest
      return
    }

    const next: NodeSize = {
      width: node.offsetWidth,
      height: node.offsetHeight,
    }
    const prev = sizeMap.value[key]
    if (prev && prev.width === next.width && prev.height === next.height) {
      return
    }
    sizeMap.value = { ...sizeMap.value, [key]: next }
  }

  return [sizeMap, setNodeSize]
}
