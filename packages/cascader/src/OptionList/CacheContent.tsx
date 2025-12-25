import type { VueNode } from '@v-c/util'
import { defineComponent, shallowRef } from 'vue'

export interface CacheContentProps {
  open?: boolean
  children?: VueNode
}

const cacheContentDefaults: CacheContentProps = {
  open: false,
}

const CacheContent = defineComponent<CacheContentProps>((props = cacheContentDefaults, { slots }) => {
  const cached = shallowRef<any[] | null>(null)

  return () => {
    if (props.open || cached.value === null) {
      cached.value = slots.default?.() ?? []
    }
    return cached.value
  }
})

export default CacheContent
